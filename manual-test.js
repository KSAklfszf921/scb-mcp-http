#!/usr/bin/env node

/**
 * Manual Test Script for SCB MCP Server
 * 
 * This script shows you how to manually test individual tools
 * Run specific tests by uncommenting the lines below
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testSingleTool(toolName, args = {}) {
  console.log(`\n🧪 Testing: ${toolName}`);
  console.log(`Arguments: ${JSON.stringify(args, null, 2)}`);
  console.log('----------------------------------------');
  
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  };

  const serverProcess = spawn('node', [join(__dirname, 'dist', 'index.js')], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return new Promise((resolve) => {
    let output = '';
    
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      try {
        const lines = output.trim().split('\n');
        for (const line of lines) {
          if (line.startsWith('{')) {
            const response = JSON.parse(line);
            console.log('📤 Response received:');
            
            if (response.error) {
              console.log('❌ Error:', response.error.message);
            } else if (response.result?.content?.[0]?.text) {
              console.log('✅ Success:');
              console.log(response.result.content[0].text);
            } else {
              console.log('📋 Raw response:', JSON.stringify(response, null, 2));
            }
            
            serverProcess.kill();
            resolve();
            return;
          }
        }
      } catch (e) {
        // Continue waiting
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.log('⚠️ Server error:', data.toString());
    });

    serverProcess.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`❌ Server exited with code ${code}`);
      }
      resolve();
    });

    // Send the request
    serverProcess.stdin.write(JSON.stringify(request) + '\n');
    
    // Timeout after 30 seconds
    setTimeout(() => {
      console.log('⏰ Timeout - killing process');
      serverProcess.kill();
      resolve();
    }, 30000);
  });
}

async function runManualTests() {
  console.log('🚀 SCB MCP Server - Manual Testing');
  console.log('==================================');
  
  // Uncomment the tests you want to run:

  // 1. Check API status and configuration
  await testSingleTool('scb_get_api_status');
  
  // 2. Check current usage
  // await testSingleTool('scb_check_usage');
  
  // 3. Browse root folder
  // await testSingleTool('scb_browse_folders');
  
  // 4. Browse specific folder (Population)
  // await testSingleTool('scb_browse_folders', { folderId: 'BE' });
  
  // 5. Search for tables
  // await testSingleTool('scb_search_tables', { query: 'population', pageSize: 3 });
  
  // 6. Get table information (try different table IDs if this fails)
  // await testSingleTool('scb_get_table_info', { tableId: 'BE0101N1' });
  
  // 7. Get table data
  // await testSingleTool('scb_get_table_data', { tableId: 'BE0101N1' });

  console.log('\n✅ Manual testing completed!');
  console.log('\n💡 Tips:');
  console.log('- Uncomment more tests in manual-test.js to try them');
  console.log('- Run "npm run test-tools" for the full automated test suite');
  console.log('- Check rate limits with scb_check_usage between tests');
}

runManualTests().catch(console.error);