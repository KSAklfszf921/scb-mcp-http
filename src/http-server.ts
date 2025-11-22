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
app.use(cors());
app.use(express.json());

// Create MCP server instance
const server = new Server(
  {
    name: 'SCB & E-hälsomyndigheten Statistics Server',
    version: '2.1.0',
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
app.get('/mcp', (req, res) => {
  res.json({
    protocol: 'mcp',
    version: '2.1.0',
    name: 'SCB & E-hälsomyndigheten Statistics Server',
    description: 'Swedish statistics and medicine data via MCP protocol',
    authentication: 'none',
    transport: 'http',
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
    tools: 14,
    connection: {
      method: 'POST',
      endpoint: '/mcp',
      content_type: 'application/json',
      format: 'MCP JSON-RPC 2.0',
    },
  });
});

// Main MCP endpoint - handles JSON-RPC requests
app.post('/mcp', async (req, res) => {
  try {
    const { jsonrpc, id, method, params } = req.body;

    if (jsonrpc !== '2.0') {
      return res.status(400).json({
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
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'SCB & E-hälsomyndigheten Statistics Server',
            version: '2.1.0',
          },
        },
      });
    }

    // Handle initialized notification
    if (method === 'notifications/initialized') {
      return res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {},
      });
    }

    // Handle tools/list
    if (method === 'tools/list') {
      const tools = getTools();
      return res.json({
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
      return res.json({
        jsonrpc: '2.0',
        id,
        result,
      });
    }

    // Method not found
    return res.status(404).json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
    });
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id || null,
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
    {
      name: 'ehealth_search_tables',
      description: 'Search medicine statistics tables',
      inputSchema: {
        type: 'object',
        properties: {
          database: {
            type: 'string',
            default: 'Detaljhandel med läkemedel',
          },
          language: {
            type: 'string',
            default: 'sv',
          },
        },
      },
    },
    {
      name: 'ehealth_get_table_info',
      description: 'Get medicine table information',
      inputSchema: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
            description: 'Table ID (e.g., LM1001)',
          },
          database: {
            type: 'string',
            default: 'Detaljhandel med läkemedel',
          },
          language: {
            type: 'string',
            default: 'sv',
          },
        },
        required: ['tableId'],
      },
    },
    {
      name: 'ehealth_get_medicine_data',
      description: 'Get medicine statistics data',
      inputSchema: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
          },
          selection: {
            type: 'object',
            description: 'Variable selection (försäljningssätt, varugrupp, period, mätvärde)',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          database: {
            type: 'string',
            default: 'Detaljhandel med läkemedel',
          },
          language: {
            type: 'string',
            default: 'sv',
          },
        },
        required: ['tableId', 'selection'],
      },
    },
  ];
}

// Tool call handler - delegates to API client
async function handleToolCall(name: string, args: any) {
  try {
    switch (name) {
      case 'scb_get_api_status':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                api_version: '2.0.0',
                max_data_cells: 150000,
                rate_limit: {
                  max_calls: 30,
                  time_window: 10,
                  remaining: 30,
                },
              }, null, 2),
            },
          ],
        };

      case 'scb_check_usage':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                calls_made: 0,
                calls_remaining: 30,
                reset_in_seconds: 10,
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

      default:
        throw new Error(`Tool not implemented in HTTP server: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            tool: name,
          }, null, 2),
        },
      ],
    };
  }
}
