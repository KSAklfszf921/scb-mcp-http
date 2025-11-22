#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPProtocol() {
  console.log('🧪 Testing MCP Protocol Communication');
  console.log('====================================\n');

  const serverProcess = spawn('node', [join(__dirname, 'dist', 'index.js')], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let testsPassed = 0;
  let totalTests = 0;

  const runTest = (testName, request, expectedInResponse) => {
    return new Promise((resolve) => {
      console.log(`🔍 Test: ${testName}`);
      totalTests++;
      
      let output = '';
      const timeout = setTimeout(() => {
        console.log('⏰ Timeout');
        resolve();
      }, 5000);

      const dataHandler = (data) => {
        output += data.toString();
        
        if (expectedInResponse.some(expected => output.includes(expected))) {
          console.log('✅ PASSED');
          testsPassed++;
          clearTimeout(timeout);
          serverProcess.stdout.removeListener('data', dataHandler);
          resolve();
        }
      };

      serverProcess.stdout.on('data', dataHandler);
      serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  };

  // Test 1: Initialize
  await runTest(
    'Initialize MCP Server',
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    },
    ['result', 'capabilities']
  );

  // Test 2: List Tools
  await runTest(
    'List Available Tools',
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    },
    ['scb_get_api_status', 'scb_browse_folders', 'tools']
  );

  // Test 3: Check Usage (doesn't require external API)
  await runTest(
    'Check Usage Tool',
    {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'scb_check_usage',
        arguments: {}
      }
    },
    ['Requests Made', 'Usage', 'content']
  );

  // Test 4: New Region Search Tool
  await runTest(
    'Search Regions Tool (New)',
    {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'scb_search_regions',
        arguments: { query: 'Stockholm' }
      }
    },
    ['Region Search', 'Stockholm', 'tables']
  );

  // Close the server
  serverProcess.kill();

  console.log(`\n📊 Results: ${testsPassed}/${totalTests} tests passed`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 All tests passed! SCB MCP Server is working correctly.');
    console.log('\n✨ **Features Available:**');
    console.log('- 📋 API Status & Usage Monitoring');
    console.log('- 🗂️ Database Navigation');
    console.log('- 🔍 Table Search (Enhanced with Categories)');
    console.log('- 📊 Table Metadata & Data Retrieval');
    console.log('- 🆕 Region Code Search (NEW!)');
    console.log('\n💡 The server is ready to use with Claude Desktop!');
    console.log('\n📝 Add this to your Claude Desktop MCP config:');
    console.log(`{
  "mcpServers": {
    "scb-statistics": {
      "command": "node",
      "args": ["${join(__dirname, 'dist', 'index.js').replace(/\\/g, '\\\\')}"],
      "description": "Statistics Sweden (SCB) data access with region search"
    }
  }
}`);
  } else {
    console.log('❌ Some tests failed. Check the output above.');
  }
}

testMCPProtocol().catch(console.error);