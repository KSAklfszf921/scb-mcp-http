#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { SCBApiClient } from './api-client.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));
app.use(express.json());

// Handle JSON parse errors (transport-level error)
app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error: Invalid JSON',
      },
    });
  }
  next();
});

// Create MCP server instance
const server = new Server(
  {
    name: 'SCB Statistics Server',
    version: '2.3.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const apiClient = new SCBApiClient();

// Setup tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getTools(),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return await handleToolCall(name, args);
});

// HTTP endpoints

// OPTIONS handler for CORS preflight
app.options('/mcp', (req, res) => {
  res.status(204).end();
});

// GET /mcp - Server information endpoint
app.get('/mcp', (req, res) => {
  res.json({
    protocol: 'mcp',
    version: '2.3.0',
    name: 'SCB Statistics Server',
    description: 'Swedish statistics data via MCP protocol',
    authentication: 'none',
    transport: 'http',
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
    tools: 11,
    connection: {
      method: 'POST',
      endpoint: '/mcp',
      content_type: 'application/json',
      format: 'MCP JSON-RPC 2.0',
    },
    compatibility: {
      platforms: ['web', 'desktop', 'cli'],
      clients: ['Claude Code', 'Claude Desktop', 'ChatGPT', 'Gemini', 'Custom MCP clients'],
    },
  });
});

// Main MCP endpoint - handles JSON-RPC requests
app.post('/mcp', async (req, res) => {
  try {
    const { jsonrpc, id, method, params } = req.body;

    // JSON-RPC 2.0 spec: All valid JSON-RPC responses use HTTP 200
    // Only transport-level errors (invalid JSON) should use HTTP 400

    // Validate JSON-RPC version
    if (jsonrpc !== '2.0') {
      return res.status(200).json({
        jsonrpc: '2.0',
        id: id || null,
        error: {
          code: -32600,
          message: 'Invalid Request: jsonrpc must be "2.0"',
        },
      });
    }

    // Handle initialize method
    if (method === 'initialize') {
      return res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'SCB Statistics Server',
            version: '2.3.0',
          },
        },
      });
    }

    // Handle initialized notification (no response per JSON-RPC spec)
    if (method === 'notifications/initialized') {
      // Notifications don't require a response, just acknowledge
      return res.status(204).end();
    }

    // Handle tools/list
    if (method === 'tools/list') {
      const tools = getTools();
      return res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {
          tools,
        },
      });
    }

    // Handle tools/call
    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      const result = await handleToolCall(name, args);
      return res.status(200).json({
        jsonrpc: '2.0',
        id,
        result,
      });
    }

    // Method not found (HTTP 200 per JSON-RPC 2.0 spec)
    return res.status(200).json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
    });
  } catch (error) {
    console.error('Error handling request:', error);
    // JSON-RPC errors use HTTP 200 (application-level error)
    return res.status(200).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
      },
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`SCB MCP HTTP Server running on port ${PORT}`);
  console.log(`Info endpoint: http://localhost:${PORT}/mcp`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Tool definitions
function getTools(): Tool[] {
  return [
    {
      name: 'scb_get_api_status',
      description: 'Get API configuration and rate limit information from Statistics Sweden',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'scb_search_tables',
      description: 'Search for statistical tables in the SCB database',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term',
          },
          pageSize: {
            type: 'number',
            description: 'Results per page (max 100)',
            default: 20,
          },
          language: {
            type: 'string',
            description: 'Language (en/sv)',
            default: 'en',
          },
          category: {
            type: 'string',
            description: 'Filter by category: population, labour, economy, housing',
          },
        },
      },
    },
    {
      name: 'scb_get_table_info',
      description: 'Get detailed metadata about a specific table',
      inputSchema: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
            description: 'Table ID (e.g., BE0101N1)',
          },
          language: {
            type: 'string',
            description: 'Language (en/sv)',
            default: 'en',
          },
        },
        required: ['tableId'],
      },
    },
    {
      name: 'scb_get_table_data',
      description: 'Get statistical data from a table',
      inputSchema: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
            description: 'Table ID',
          },
          selection: {
            type: 'object',
            description: 'Variable selection (variable: [values])',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          language: {
            type: 'string',
            default: 'en',
          },
        },
        required: ['tableId'],
      },
    },
    {
      name: 'scb_check_usage',
      description: 'Check current API usage and rate limits',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'scb_search_regions',
      description: 'Search for region codes by name',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Region name to search',
          },
          language: {
            type: 'string',
            default: 'en',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'scb_get_table_variables',
      description: 'Get available variables and values for a table',
      inputSchema: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
            description: 'Table ID',
          },
          language: {
            type: 'string',
            default: 'en',
          },
          variableName: {
            type: 'string',
            description: 'Optional: specific variable',
          },
        },
        required: ['tableId'],
      },
    },
    {
      name: 'scb_find_region_code',
      description: 'Find exact region code for a municipality',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Municipality name',
          },
          tableId: {
            type: 'string',
            description: 'Optional: specific table',
          },
          language: {
            type: 'string',
            default: 'en',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'scb_test_selection',
      description: 'Test if a data selection is valid',
      inputSchema: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
          },
          selection: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          language: {
            type: 'string',
            default: 'en',
          },
        },
        required: ['tableId', 'selection'],
      },
    },
    {
      name: 'scb_preview_data',
      description: 'Get a small preview of data',
      inputSchema: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
          },
          selection: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          language: {
            type: 'string',
            default: 'en',
          },
        },
        required: ['tableId'],
      },
    },
    {
      name: 'scb_browse_folders',
      description: 'Browse database folders (deprecated in API v2)',
      inputSchema: {
        type: 'object',
        properties: {
          folderId: {
            type: 'string',
            description: 'Folder ID',
          },
          language: {
            type: 'string',
            default: 'en',
          },
        },
      },
    },
  ];
}

// Tool call handler - delegates to API client
async function handleToolCall(name: string, args: any) {
  try {
    switch (name) {
      case 'scb_get_api_status':
        const config = await apiClient.getConfig();
        const rateLimitInfo = apiClient.getRateLimitInfo();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                api_version: config.apiVersion || '2.0.0',
                max_data_cells: config.maxDataCells || 150000,
                rate_limit: {
                  max_calls: rateLimitInfo?.maxCalls || 30,
                  time_window: rateLimitInfo?.timeWindow || 10,
                  remaining: rateLimitInfo?.remaining || 30,
                },
              }, null, 2),
            },
          ],
        };

      case 'scb_check_usage':
        const usageInfo = apiClient.getUsageInfo();
        const resetIn = usageInfo.rateLimitInfo?.resetTime
          ? Math.max(0, Math.ceil((usageInfo.rateLimitInfo.resetTime.getTime() - Date.now()) / 1000))
          : 10;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                calls_made: usageInfo.requestCount,
                calls_remaining: usageInfo.rateLimitInfo?.remaining || 30,
                reset_in_seconds: resetIn,
                window_start: usageInfo.windowStart.toISOString(),
              }, null, 2),
            },
          ],
        };

      case 'scb_search_tables':
        const searchResult = await apiClient.searchTables({
          query: args.query,
          pageSize: args.pageSize || 20,
          lang: args.language || 'en',
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(searchResult, null, 2),
            },
          ],
        };

      case 'scb_get_table_info':
        const tableInfo = await apiClient.getTableMetadata(
          args.tableId,
          args.language || 'en'
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tableInfo, null, 2),
            },
          ],
        };

      case 'scb_get_table_variables':
        const metadata = await apiClient.getTableMetadata(args.tableId, args.language || 'en');
        const variablesList = Object.keys(metadata.dimension || {}).map(varName => ({
          variable_code: varName,
          variable_name: varName,
          total_values: metadata.dimension[varName]?.category?.index ? Object.keys(metadata.dimension[varName].category.index).length : 0,
          sample_values: metadata.dimension[varName]?.category?.index ?
            Object.entries(metadata.dimension[varName].category.index).slice(0, 10).map(([code, idx]) => ({
              code,
              label: metadata.dimension[varName].category.label?.[code] || code,
            })) : []
        }));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                table_id: args.tableId,
                variables: args.variableName ?
                  variablesList.filter(v => v.variable_name === args.variableName) :
                  variablesList
              }, null, 2),
            },
          ],
        };

      case 'scb_get_table_data':
        const data = await apiClient.getTableData(
          args.tableId,
          args.selection,
          args.language || 'en'
        );
        const structured = apiClient.transformToStructuredData(data, args.selection);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(structured, null, 2),
            },
          ],
        };

      case 'scb_test_selection':
        const validation = await apiClient.validateSelection(
          args.tableId,
          args.selection,
          args.language || 'en'
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                is_valid: validation.isValid,
                errors: validation.errors,
                suggestions: validation.suggestions,
                translated_selection: validation.translatedSelection,
              }, null, 2),
            },
          ],
        };

      case 'scb_preview_data':
        // Get metadata first to understand table structure
        const previewMetadata = await apiClient.getTableMetadata(args.tableId, args.language || 'en');

        // Create a limited selection automatically if none provided
        let previewSelection = args.selection;
        if (!previewSelection && previewMetadata.dimension) {
          // Build automatic selection with first 5 values or "*" for each dimension
          previewSelection = {};
          for (const [dimName, dimDef] of Object.entries(previewMetadata.dimension)) {
            const values = Object.keys(dimDef.category.index);
            // Limit to first 3 values to keep preview small
            previewSelection[dimName] = values.length <= 3 ? values : values.slice(0, 3);
          }
        }

        const previewData = await apiClient.getTableData(
          args.tableId,
          previewSelection,
          args.language || 'en'
        );
        const previewStructured = apiClient.transformToStructuredData(previewData, previewSelection);

        // Limit to first 20 records
        const limitedData = {
          ...previewStructured,
          data: previewStructured.data.slice(0, 20),
          summary: {
            ...previewStructured.summary,
            displayed_records: Math.min(20, previewStructured.data.length),
            total_records: previewStructured.summary.total_records,
            note: previewStructured.data.length > 20
              ? `Showing first 20 of ${previewStructured.data.length} records. Use scb_get_table_data with specific selection for full data.`
              : 'Showing all records',
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(limitedData, null, 2),
            },
          ],
        };

      case 'scb_browse_folders':
        const folderData = await apiClient.getNavigation(
          args.folderId,
          args.language || 'en'
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(folderData, null, 2),
            },
          ],
        };

      case 'scb_search_regions':
        const regions = await apiClient.searchRegions(
          args.query,
          args.language || 'en'
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                query: args.query,
                results: regions,
                total_found: regions.length,
              }, null, 2),
            },
          ],
        };

      case 'scb_find_region_code':
        const regionMatch = await apiClient.findRegionCode(
          args.query,
          args.tableId,
          args.language || 'en'
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                query: args.query,
                exact_matches: regionMatch.exact_matches,
                suggestions: regionMatch.suggestions,
              }, null, 2),
            },
          ],
        };

      default:
        throw new Error(`Tool not implemented in HTTP server: ${name}`);
    }
  } catch (error) {
    // Parse error message to extract structured info
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Try to extract SCB API error details from message
    let scbError = null;
    let httpStatus = null;

    // Check if message contains SCB JSON error
    const jsonMatch = errorMessage.match(/(\{.*"type".*\})/);
    if (jsonMatch) {
      try {
        scbError = JSON.parse(jsonMatch[1]);
      } catch (e) {
        // Not valid JSON, continue
      }
    }

    // Extract HTTP status code
    const statusMatch = errorMessage.match(/(\d{3})\s+([\w\s]+?):/);
    if (statusMatch) {
      httpStatus = parseInt(statusMatch[1]);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: {
              tool: name,
              message: errorMessage,
              http_status: httpStatus,
              scb_error: scbError,
              timestamp: new Date().toISOString(),
            },
          }, null, 2),
        },
      ],
    };
  }
}
