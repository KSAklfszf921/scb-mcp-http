#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testFixes() {
  console.log('🧪 Testing SCB MCP Server Fixes');
  console.log('================================\n');

  const tests = [
    {
      name: 'API Status (should work)',
      request: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'scb_get_api_status',
          arguments: {}
        }
      },
      expectSuccess: true
    },
    {
      name: 'List Resources (should not error now)', 
      request: {
        jsonrpc: '2.0',
        id: 2,
        method: 'resources/list',
        params: {}
      },
      expectSuccess: true
    },
    {
      name: 'List Prompts (should not error now)',
      request: {
        jsonrpc: '2.0', 
        id: 3,
        method: 'prompts/list',
        params: {}
      },
      expectSuccess: true
    },
    {
      name: 'Table Info (should handle schema better)',
      request: {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'scb_get_table_info',
          arguments: {
            tableId: 'TAB6534', // Known table from the logs
            language: 'en'
          }
        }
      },
      expectSuccess: true
    },
    {
      name: 'Browse Population folder',
      request: {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'scb_browse_folders',
          arguments: {
            folderId: 'BE',
            language: 'en'
          }
        }
      },
      expectSuccess: true
    }
  ];

  for (const test of tests) {
    console.log(`🔍 ${test.name}`);
    
    const result = await runSingleTest(test.request);
    
    if (result.includes('Error:')) {
      console.log(`❌ FAILED: ${result.substring(0, 200)}...`);
    } else if (result.includes('"error"')) {
      if (test.expectSuccess) {
        console.log(`❌ FAILED: ${result.substring(0, 200)}...`);
      } else {
        console.log(`✅ Expected error: ${result.substring(0, 100)}...`);
      }
    } else {
      console.log(`✅ PASSED: ${result.substring(0, 150)}...`);
    }
    
    console.log('');
    
    // Wait between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function runSingleTest(request) {
  return new Promise((resolve) => {
    const serverProcess = spawn('node', [join(__dirname, 'dist', 'index.js')], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    
    const timeout = setTimeout(() => {
      if (!serverProcess.killed) {
        serverProcess.kill();
      }
      resolve(output || 'Timeout - no response');
    }, 15000);

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      
      // Look for JSON response
      if (output.includes('"result"') || output.includes('"error"')) {
        clearTimeout(timeout);
        serverProcess.kill();
        resolve(output);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      output += 'STDERR: ' + data.toString();
    });

    serverProcess.on('error', (err) => {
      clearTimeout(timeout);
      resolve(`Process error: ${err.message}`);
    });

    try {
      serverProcess.stdin.write(JSON.stringify(request) + '\n');
    } catch (e) {
      clearTimeout(timeout);
      resolve(`Failed to send request: ${e.message}`);
    }
  });
}

testFixes().catch(console.error);