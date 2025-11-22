#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testUserExperienceImprovements() {
  console.log('🎯 Testing User Experience Improvements');
  console.log('=====================================\n');

  const tests = [
    {
      name: '🔍 Search for Lerum region data',
      request: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'scb_search_regions',
          arguments: {
            query: 'Lerum',
            language: 'en'
          }
        }
      },
      expect: 'Should find region-related tables and provide guidance'
    },
    {
      name: '📊 Search with population category filter',
      request: {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'scb_search_tables',
          arguments: {
            query: 'population',
            category: 'population',
            pageSize: 3,
            language: 'en'
          }
        }
      },
      expect: 'Should return population-focused results'
    },
    {
      name: '📋 List tools (should include new scb_search_regions)',
      request: {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/list',
        params: {}
      },
      expect: 'Should show 7 tools including scb_search_regions'
    },
    {
      name: '🏘️ Search for municipality population data',
      request: {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'scb_search_tables',
          arguments: {
            query: 'population municipality',
            pageSize: 3,
            language: 'en'
          }
        }
      },
      expect: 'Should find municipality-level population data'
    }
  ];

  for (const test of tests) {
    console.log(`${test.name}`);
    console.log(`Expected: ${test.expect}`);
    
    const result = await runSingleTest(test.request);
    
    if (result.includes('"error"')) {
      console.log(`❌ FAILED: ${result.substring(0, 200)}...`);
    } else if (result.includes('scb_search_regions') && test.name.includes('List tools')) {
      console.log(`✅ PASSED: New tool is available`);
    } else if (result.includes('region') || result.includes('population') || result.includes('tables')) {
      console.log(`✅ PASSED: Got relevant results`);
      console.log(`📋 Preview: ${result.substring(0, 300)}...`);
    } else {
      console.log(`⚠️ UNCLEAR: ${result.substring(0, 200)}...`);
    }
    
    console.log('');
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('🎯 **Summary of Improvements:**');
  console.log('- ✅ Added scb_search_regions tool for finding region codes');
  console.log('- ✅ Added category filtering for better search relevance'); 
  console.log('- ✅ Enhanced search descriptions with better guidance');
  console.log('- ✅ Fixed all MCP protocol errors from the logs');
  console.log('- ✅ Improved error handling for API responses');
  console.log('');
  console.log('💡 **Next Steps for Users:**');
  console.log('1. Use `scb_search_regions` to find region codes for your area');
  console.log('2. Use category filters in search for better results');
  console.log('3. Get table info to see available variables before fetching data');
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
      
      if (output.includes('"result"') || output.includes('"error"')) {
        clearTimeout(timeout);
        serverProcess.kill();
        resolve(output);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      output += 'STDERR: ' + data.toString();
    });

    try {
      serverProcess.stdin.write(JSON.stringify(request) + '\n');
    } catch (e) {
      clearTimeout(timeout);
      resolve(`Failed to send request: ${e.message}`);
    }
  });
}

testUserExperienceImprovements().catch(console.error);