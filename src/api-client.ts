import fetch from 'node-fetch';
import { 
  ConfigResponse, 
  ConfigResponseSchema,
  FolderResponse, 
  FolderResponseSchema,
  TablesResponse, 
  TablesResponseSchema,
  Dataset, 
  DatasetSchema,
  RateLimitInfo 
} from './types.js';

export class SCBApiClient {
  private baseUrl: string;
  private rateLimitInfo: RateLimitInfo | null = null;
  private requestCount = 0;
  private windowStartTime = new Date();

  constructor(baseUrl = 'https://api.scb.se/OV0104/v2beta/api/v2') {
    this.baseUrl = baseUrl;
  }

  private async initializeRateLimit(): Promise<void> {
    if (this.rateLimitInfo) return;

    try {
      // Make direct config request without rate limiting to avoid circular dependency
      const url = `${this.baseUrl}/config`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SCB-MCP-Client/1.0'
        }
      });

      if (!response.ok) {
        // Fallback to default values if config fails
        console.warn('Failed to fetch config, using default rate limits');
        this.rateLimitInfo = {
          remaining: 30,
          resetTime: new Date(Date.now() + 10000),
          maxCalls: 30,
          timeWindow: 10
        };
        return;
      }

      const data = await response.json();
      const config = ConfigResponseSchema.parse(data);
      
      this.rateLimitInfo = {
        remaining: config.maxCallsPerTimeWindow,
        resetTime: new Date(Date.now() + config.timeWindow * 1000),
        maxCalls: config.maxCallsPerTimeWindow,
        timeWindow: config.timeWindow
      };
    } catch (error) {
      // Fallback to reasonable defaults if anything fails
      console.warn('Failed to initialize rate limits, using defaults:', error);
      this.rateLimitInfo = {
        remaining: 30,
        resetTime: new Date(Date.now() + 10000),
        maxCalls: 30,
        timeWindow: 10
      };
    }
  }

  private async checkRateLimit(): Promise<void> {
    if (!this.rateLimitInfo) {
      await this.initializeRateLimit();
    }

    const now = new Date();
    
    // Reset window if time has passed
    if (now >= this.rateLimitInfo!.resetTime) {
      this.requestCount = 0;
      this.windowStartTime = now;
      this.rateLimitInfo!.resetTime = new Date(now.getTime() + this.rateLimitInfo!.timeWindow * 1000);
      this.rateLimitInfo!.remaining = this.rateLimitInfo!.maxCalls;
    }

    if (this.requestCount >= this.rateLimitInfo!.maxCalls) {
      const waitTime = this.rateLimitInfo!.resetTime.getTime() - now.getTime();
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds. Current usage: ${this.requestCount}/${this.rateLimitInfo!.maxCalls}`);
    }
  }

  private async makeRequest<T>(endpoint: string, schema: any): Promise<T> {
    await this.checkRateLimit();
    
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SCB-MCP-Client/1.0'
      }
    });

    this.requestCount++;
    if (this.rateLimitInfo) {
      this.rateLimitInfo.remaining = Math.max(0, this.rateLimitInfo.maxCalls - this.requestCount);
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded (429). Wait and try again.`);
      }
      
      // Try to get error details from response body
      let errorDetails = '';
      try {
        const errorText = await response.text();
        if (errorText.includes('<!DOCTYPE html') || errorText.includes('<html')) {
          errorDetails = ' (Server returned HTML error page)';
        } else {
          errorDetails = `: ${errorText.substring(0, 100)}`;
        }
      } catch (e) {
        // Ignore error reading response body
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}${errorDetails}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      throw new Error(`Expected JSON response but got ${contentType}. Response: ${responseText.substring(0, 100)}...`);
    }

    const data = await response.json();
    return schema.parse(data);
  }

  async getConfig(): Promise<ConfigResponse> {
    return this.makeRequest('/config', ConfigResponseSchema);
  }

  async getNavigation(folderId?: string, lang = 'en'): Promise<FolderResponse> {
    const endpoint = folderId 
      ? `/navigation/${folderId}?lang=${lang}`
      : `/navigation?lang=${lang}`;
    return this.makeRequest(endpoint, FolderResponseSchema);
  }

  async searchTables(params: {
    query?: string;
    pastDays?: number;
    includeDiscontinued?: boolean;
    pageNumber?: number;
    pageSize?: number;
    lang?: string;
  } = {}): Promise<TablesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.set('query', params.query);
    if (params.pastDays) searchParams.set('pastDays', params.pastDays.toString());
    if (params.includeDiscontinued !== undefined) searchParams.set('includeDiscontinued', params.includeDiscontinued.toString());
    if (params.pageNumber) searchParams.set('pageNumber', params.pageNumber.toString());
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params.lang) searchParams.set('lang', params.lang);

    const endpoint = `/tables?${searchParams.toString()}`;
    return this.makeRequest(endpoint, TablesResponseSchema);
  }

  async getTableMetadata(tableId: string, lang = 'en'): Promise<Dataset> {
    const endpoint = `/tables/${tableId}/metadata?lang=${lang}`;
    return this.makeRequest(endpoint, DatasetSchema);
  }

  private translateCommonVariables(selection: Record<string, string[]>, lang: string): Record<string, string[]> {
    // Bidirectional variable name mappings (handles both directions and case variations)
    const variableMapping: Record<string, string> = {
      // Swedish -> English
      'år': 'Tid',
      'månad': 'Tid', 
      'kön': 'Kon',
      'ålder': 'Alder',
      'län': 'Region',
      'kommun': 'Region',
      'utbildning': 'UtbildningsNiva',
      'sysselsättning': 'Sysselsattning',
      'inkomst': 'Inkomst',
      'familjetyp': 'Familjetyp',
      'civilstånd': 'Civilstand',
      
      // English -> Swedish (common API variable names)
      'year': 'Tid',
      'time': 'Tid',
      'month': 'Tid',
      'sex': 'Kon',
      'gender': 'Kon',
      'age': 'Alder',
      'county': 'Region',
      'municipality': 'Region',
      'education': 'UtbildningsNiva',
      'employment': 'Sysselsattning',
      'income': 'Inkomst',
      'family_type': 'Familjetyp',
      'marital_status': 'Civilstand',
      
      // Case variations (lowercase -> proper case)
      'region': 'Region',
      'alder': 'Alder',
      'kon': 'Kon',
      'tid': 'Tid',
      'utbildningsniva': 'UtbildningsNiva',
      'sysselsattning': 'Sysselsattning',
      'civilstand': 'Civilstand',
      'contentscode': 'ContentsCode',
      'observations': 'ContentsCode',  // Both can map to same API variable name
      'contents': 'ContentsCode'
    };

    const translatedSelection: Record<string, string[]> = {};
    
    for (const [key, values] of Object.entries(selection)) {
      // Try exact match first, then lowercase match
      const mappedKey = variableMapping[key] || variableMapping[key.toLowerCase()] || key;
      translatedSelection[mappedKey] = values;
    }
    
    return translatedSelection;
  }

  private translateCommonValues(values: string[], variableName: string): string[] {
    const valueMapping: Record<string, Record<string, string>> = {
      // Age/Alder common values
      'Alder': {
        'total': 'tot',
        'all': 'tot',
        'totalt': 'tot',
        'totals': 'TotSA', // Sometimes it's TotSA in certain tables
      },
      // Time/Tid common values
      'Tid': {
        'latest': '2024', // Fallback to recent year
        'recent': '2024',
        'current': '2024',
      },
      // Sex/Gender common values  
      'Kon': {
        'total': 'tot',
        'all': 'tot',
        'male': '1',
        'female': '2',
        'men': '1',
        'women': '2',
        'man': '1',
        'woman': '2',
      },
      // General mappings for any variable
      '*': {
        'total': 'tot',
        'all': '*',
        'totalt': 'tot',
        'alla': '*',
      }
    };

    return values.map(value => {
      // Check specific variable mapping first
      const specificMapping = valueMapping[variableName];
      if (specificMapping && specificMapping[value.toLowerCase()]) {
        return specificMapping[value.toLowerCase()];
      }
      
      // Check general mapping
      const generalMapping = valueMapping['*'];
      if (generalMapping && generalMapping[value.toLowerCase()]) {
        return generalMapping[value.toLowerCase()];
      }
      
      // Handle time format detection
      if (variableName === 'Tid' && value.match(/^\d{4}$/)) {
        // Year format is correct
        return value;
      } else if (variableName === 'Tid' && value.match(/^\d{4}-\d{2}$/)) {
        // Convert YYYY-MM to YYYYMM format
        return value.replace('-', 'M');
      }
      
      return value;
    });
  }

  async validateSelection(
    tableId: string,
    selection: Record<string, string[]>,
    lang = 'en'
  ): Promise<{ isValid: boolean; errors: string[]; suggestions: string[]; translatedSelection?: Record<string, string[]> }> {
    try {
      // Try to translate common Swedish terms first
      const originalSelection = { ...selection };
      let translatedSelection = this.translateCommonVariables(selection, lang);
      
      // Also translate common values
      const finalSelection: Record<string, string[]> = {};
      for (const [varName, values] of Object.entries(translatedSelection)) {
        finalSelection[varName] = this.translateCommonValues(values, varName);
      }
      translatedSelection = finalSelection;
      
      // Get table metadata to validate against
      const metadata = await this.getTableMetadata(tableId, lang);
      
      const errors: string[] = [];
      const suggestions: string[] = [];
      
      if (!metadata.dimension) {
        return {
          isValid: false,
          errors: ['Table metadata not available for validation'],
          suggestions: ['Try using scb_get_table_info first']
        };
      }
      
      const availableVariables = Object.keys(metadata.dimension);
      
      // Check for missing mandatory dimensions
      const selectedVariables = Object.keys(translatedSelection);
      const missingVariables = availableVariables.filter(varName => !selectedVariables.includes(varName));
      
      if (missingVariables.length > 0) {
        errors.push(`Missing mandatory variables: ${missingVariables.join(', ')}`);
        suggestions.push(`SCB tables require all dimensions to be specified. Add these variables to your selection: ${missingVariables.join(', ')}`);
        suggestions.push(`Use "*" as value to select all values for a dimension, e.g. {"${missingVariables[0]}": ["*"]}`);
      }

      // Check each variable in translated selection
      for (const [varCode, values] of Object.entries(translatedSelection)) {
        // Check if variable exists
        if (!availableVariables.includes(varCode)) {
          errors.push(`Variable "${varCode}" not found in table`);
          
          // Find similar variable names
          const similar = availableVariables.filter(v => 
            v.toLowerCase().includes(varCode.toLowerCase()) ||
            metadata.dimension![v].label.toLowerCase().includes(varCode.toLowerCase())
          );
          
          if (similar.length > 0) {
            suggestions.push(`Did you mean: ${similar.map(v => `"${v}"`).join(', ')}?`);
          } else {
            suggestions.push(`Available variables: ${availableVariables.join(', ')}`);
          }
          continue;
        }
        
        const varDef = metadata.dimension[varCode];
        const availableValues = Object.keys(varDef.category.index);
        
        // Check each value (skip special expressions like TOP(5), *, etc.)
        for (const value of values) {
          if (value === '*' || 
              value.startsWith('TOP(') || 
              value.startsWith('BOTTOM(') ||
              value.startsWith('RANGE(')) {
            continue; // These are valid expressions
          }
          
          if (!availableValues.includes(value)) {
            errors.push(`Value "${value}" not found for variable "${varCode}"`);
            
            // Find similar values
            const similarValues = availableValues.filter(v => 
              v.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 3);
            
            if (similarValues.length > 0) {
              suggestions.push(`For "${varCode}", did you mean: ${similarValues.join(', ')}?`);
            } else {
              suggestions.push(`Use scb_get_table_variables with tableId="${tableId}" and variableName="${varCode}" to see all values`);
            }
          }
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        suggestions,
        translatedSelection
      };
      
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
        suggestions: ['Try checking if the table ID is correct with scb_get_table_info']
      };
    }
  }

  async getTableData(
    tableId: string, 
    selection?: Record<string, string[]>,
    lang = 'en'
  ): Promise<Dataset> {
    if (!selection) {
      // Get default selection - request JSON-stat2 format
      const endpoint = `/tables/${tableId}/data?lang=${lang}&outputFormat=json-stat2`;
      return this.makeRequest(endpoint, DatasetSchema);
    }

    // Validate selection before making API call
    const validation = await this.validateSelection(tableId, selection, lang);
    if (!validation.isValid) {
      const errorMessage = `Selection validation failed:\n${validation.errors.join('\n')}` +
        (validation.suggestions.length > 0 ? `\n\nSuggestions:\n${validation.suggestions.join('\n')}` : '');
      throw new Error(errorMessage);
    }

    // Use the translated selection for the API call
    const finalSelection = validation.translatedSelection || selection;

    // Use POST for complex selections - request JSON-stat2 format  
    const url = `${this.baseUrl}/tables/${tableId}/data?lang=${lang}&outputFormat=json-stat2`;
    
    await this.checkRateLimit();
    
    const selectionArray = Object.entries(finalSelection).map(([variableCode, valueCodes]) => ({
      variableCode: variableCode,
      valueCodes: Array.isArray(valueCodes) ? valueCodes : [valueCodes]
    }));


    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SCB-MCP-Client/1.0'
      },
      body: JSON.stringify({
        selection: selectionArray
      })
    });

    this.requestCount++;
    if (this.rateLimitInfo) {
      this.rateLimitInfo.remaining = Math.max(0, this.rateLimitInfo.maxCalls - this.requestCount);
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded (429). Wait and try again.`);
      }
      if (response.status === 403) {
        throw new Error(`Request forbidden (403). The query may result in too many data cells (limit: ${this.rateLimitInfo?.maxCalls || 'unknown'}). Try using more specific selections.`);
      }
      if (response.status === 400) {
        // Parse 400 errors more specifically with actionable guidance
        let errorMessage = 'Bad request (400)';
        let troubleshootingTips = [];
        
        try {
          const errorText = await response.text();
          
          // Look for specific error patterns
          if (errorText.toLowerCase().includes('variable') || errorText.toLowerCase().includes('variablecode')) {
            errorMessage = 'Invalid variable name or code in selection';
            troubleshootingTips.push('Use scb_get_table_variables to see all available variable names');
            troubleshootingTips.push('Check that variable names match exactly (case-sensitive)');
            troubleshootingTips.push('Try scb_test_selection to validate your selection first');
          } else if (errorText.toLowerCase().includes('value') || errorText.toLowerCase().includes('valuecode')) {
            errorMessage = 'Invalid variable values in selection';
            troubleshootingTips.push('Use scb_get_table_variables with variableName to see valid values');
            troubleshootingTips.push('For time data, try formats like "2024" or "2024M12" for monthly');
            troubleshootingTips.push('For regions, verify codes with scb_find_region_code');
          } else if (errorText.toLowerCase().includes('selection')) {
            errorMessage = 'Invalid selection format or syntax';
            troubleshootingTips.push('Use format: {"VariableName": ["value1", "value2"]}');
            troubleshootingTips.push('Ensure variable names use proper case (e.g., "Region", not "region")');
            troubleshootingTips.push('Test your selection with scb_test_selection first');
          } else if (errorText.toLowerCase().includes('time') || errorText.toLowerCase().includes('date')) {
            errorMessage = 'Invalid time/date format in selection';
            troubleshootingTips.push('For annual data, use "2024"');
            troubleshootingTips.push('For monthly data, use "2024M12" format');
            troubleshootingTips.push('Check available time values with scb_get_table_variables');
          } else {
            // Generic error with server response
            errorMessage = `Bad request (400): ${errorText.substring(0, 150)}`;
            troubleshootingTips.push('Use scb_test_selection to validate your selection');
            troubleshootingTips.push('Check variable names and values with scb_get_table_variables');
          }
          
        } catch (e) {
          errorMessage = 'Bad request (400) - Could not parse error details';
          troubleshootingTips.push('Use scb_test_selection to validate your selection');
          troubleshootingTips.push('Check the table and selection format');
        }
        
        const fullError = troubleshootingTips.length > 0 
          ? `${errorMessage}\n\nTroubleshooting suggestions:\n${troubleshootingTips.map(tip => `• ${tip}`).join('\n')}`
          : errorMessage;
          
        throw new Error(fullError);
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return DatasetSchema.parse(data);
  }

  /**
   * Transform JSON-stat2 data into structured records for easy analysis
   */
  transformToStructuredData(jsonStat2Data: Dataset, selection?: Record<string, string[]>): {
    query: any;
    data: Array<Record<string, any>>;
    metadata: any;
    summary: any;
  } {
    const records: Array<Record<string, any>> = [];
    
    if (!jsonStat2Data.value || !jsonStat2Data.dimension) {
      return {
        query: { selection, table_id: null },
        data: [],
        metadata: {
          source: jsonStat2Data.source || "Statistics Sweden",
          updated: jsonStat2Data.updated,
          table_name: jsonStat2Data.label
        },
        summary: { total_records: 0, has_data: false }
      };
    }

    const dimensions = Object.entries(jsonStat2Data.dimension);
    const dimensionSizes = dimensions.map(([_, dimDef]) => Object.keys(dimDef.category.index).length);
    
    // Transform each data point into a structured record
    jsonStat2Data.value.forEach((value, flatIndex) => {
      if (value === null) return; // Skip null values
      
      const record: Record<string, any> = {};
      
      // Calculate the multi-dimensional indices from the flat array index
      let temp = flatIndex;
      for (let i = dimensions.length - 1; i >= 0; i--) {
        const [dimName, dimDef] = dimensions[i];
        const dimSize = dimensionSizes[i];
        const dimIndex = temp % dimSize;
        temp = Math.floor(temp / dimSize);
        
        // Get the code and label for this dimension value
        const codes = Object.keys(dimDef.category.index);
        const code = codes[dimIndex];
        const label = dimDef.category.label ? dimDef.category.label[code] : code;
        
        // Add both code and human-readable name to the record
        const baseName = this.getDimensionBaseName(dimName);
        record[`${baseName}_code`] = code;
        record[`${baseName}_name`] = label || code;
      }
      
      record.value = value;
      records.push(record);
    });

    // Calculate summary statistics
    const totalRecords = records.length;
    const totalValue = records.reduce((sum, record) => sum + (record.value || 0), 0);
    const nonNullRecords = records.filter(r => r.value !== null && r.value !== undefined);

    return {
      query: {
        selection: selection || {},
        table_id: jsonStat2Data.id ? jsonStat2Data.id[0] : null,
        requested_at: new Date().toISOString()
      },
      data: records,
      metadata: {
        source: jsonStat2Data.source || "Statistics Sweden", 
        updated: jsonStat2Data.updated,
        table_name: jsonStat2Data.label,
        data_shape: jsonStat2Data.size,
        dimensions: dimensions.map(([name, def]) => ({
          name,
          label: def.label,
          values_count: Object.keys(def.category.index).length
        }))
      },
      summary: {
        total_records: totalRecords,
        non_null_records: nonNullRecords.length,
        total_value: totalValue,
        has_data: totalRecords > 0
      }
    };
  }

  /**
   * Convert dimension names to user-friendly base names
   */
  getDimensionBaseName(dimName: string): string {
    const nameMapping: Record<string, string> = {
      'Region': 'region',
      'Alder': 'age', 
      'Kon': 'sex',
      'Tid': 'year',
      'UtbildningsNiva': 'education_level',
      'ContentsCode': 'observation_type',
      'Sysselsattning': 'employment_status',
      'Civilstand': 'marital_status',
      'Familjetyp': 'family_type'
    };
    
    return nameMapping[dimName] || dimName.toLowerCase();
  }

  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  getUsageInfo(): { requestCount: number; windowStart: Date; rateLimitInfo: RateLimitInfo | null } {
    return {
      requestCount: this.requestCount,
      windowStart: this.windowStartTime,
      rateLimitInfo: this.rateLimitInfo
    };
  }
}