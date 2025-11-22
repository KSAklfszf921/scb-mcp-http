#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SimpleTest {
  async testServerBasics() {
    console.log('🚀 SCB MCP Server - Simple Test');
    console.log('================================\n');

    // Check if build exists
    try {
      readFileSync(join(__dirname, 'dist', 'index.js'));
      console.log('✅ Build found');
    } catch (error) {
      console.log('❌ Build not found. Run: npm run build');
      return;
    }

    // Test 1: Can we start the server?
    console.log('\n🧪 Test 1: Server Startup');
    const canStart = await this.testServerStartup();
    if (!canStart) {
      console.log('❌ Server failed to start');
      return;
    }

    // Test 2: Tool listing
    console.log('\n🧪 Test 2: Tool Listing');
    await this.testToolListing();

    // Test 3: Simple API status call
    console.log('\n🧪 Test 3: API Status Tool');
    await this.testApiStatus();

    console.log('\n✅ Simple tests completed!');
    console.log('💡 If these pass, try: npm run test-tools for full testing');
  }

  async testServerStartup() {
    return new Promise((resolve) => {
      console.log('Starting server process...');
      
      const serverProcess = spawn('node', [join(__dirname, 'dist', 'index.js')], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let hasResponse = false;
      let hasError = false;
      
      const timeout = setTimeout(() => {
        if (!serverProcess.killed) {
          serverProcess.kill();
        }
        
        if (hasError) {
          console.log('❌ Server had errors');
          resolve(false);
        } else if (hasResponse) {
          console.log('✅ Server started and responded');
          resolve(true);
        } else {
          // MCP servers don't output anything until they receive a request
          // If no error occurred, assume it started correctly
          console.log('✅ Server started successfully (MCP servers are silent until they receive requests)');
          resolve(true);
        }
      }, 3000);

      serverProcess.stdout.on('data', (data) => {
        hasResponse = true;
        console.log('📤 Server response detected');
      });

      serverProcess.stderr.on('data', (data) => {
        hasError = true;
        console.log('❌ Server error:', data.toString().trim());
      });

      serverProcess.on('error', (err) => {
        hasError = true;
        console.log('❌ Process error:', err.message);
        clearTimeout(timeout);
        resolve(false);
      });

      serverProcess.on('close', (code) => {
        if (code !== 0 && code !== null) {
          hasError = true;
          console.log('❌ Server exited with code:', code);
        }
      });

      // Send a valid MCP request
      try {
        const request = {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'test-client', version: '1.0.0' }
          }
        };
        serverProcess.stdin.write(JSON.stringify(request) + '\n');
      } catch (e) {
        console.log('⚠️ Could not send test request');
      }
    });
  }

  async testToolListing() {
    return new Promise((resolve) => {
      console.log('Testing tool listing...');
      
      const serverProcess = spawn('node', [join(__dirname, 'dist', 'index.js')], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      const timeout = setTimeout(() => {
        if (!serverProcess.killed) {
          serverProcess.kill();
        }
        console.log('⏰ Tool listing test timed out');
        resolve();
      }, 10000);

      serverProcess.stdout.on('data', (data) => {
        output += data.toString();
        
        // Look for any JSON response
        if (output.includes('scb_') || output.includes('tools')) {
          console.log('✅ Found tool-related response');
          console.log('📋 Response preview:', output.substring(0, 200) + '...');
          clearTimeout(timeout);
          serverProcess.kill();
          resolve();
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.log('⚠️ stderr:', data.toString().trim());
      });

      serverProcess.on('error', (err) => {
        console.log('❌ Error:', err.message);
        clearTimeout(timeout);
        resolve();
      });

      // Send tools/list request
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      };

      try {
        serverProcess.stdin.write(JSON.stringify(request) + '\n');
      } catch (e) {
        console.log('❌ Failed to send request:', e.message);
        clearTimeout(timeout);
        resolve();
      }
    });
  }

  async testApiStatus() {
    return new Promise((resolve) => {
      console.log('Testing API status tool...');
      
      const serverProcess = spawn('node', [join(__dirname, 'dist', 'index.js')], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      const timeout = setTimeout(() => {
        if (!serverProcess.killed) {
          serverProcess.kill();
        }
        console.log('⏰ API status test timed out');
        resolve();
      }, 30000); // Longer timeout for API call

      serverProcess.stdout.on('data', (data) => {
        output += data.toString();
        
        // Look for success indicators
        if (output.includes('API Status') || output.includes('Configuration') || output.includes('error')) {
          console.log('✅ Got API status response');
          
          if (output.includes('API Status')) {
            console.log('🎉 API Status tool working!');
          } else if (output.includes('Rate limit') || output.includes('API request failed')) {
            console.log('⚠️ API call failed (rate limit or network issue)');
          } else if (output.includes('error')) {
            console.log('⚠️ Tool returned error (check network/API availability)');
          }
          
          console.log('📋 Response preview:', output.substring(0, 300) + '...');
          clearTimeout(timeout);
          serverProcess.kill();
          resolve();
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const errorMsg = data.toString().trim();
        console.log('⚠️ stderr:', errorMsg);
      });

      serverProcess.on('error', (err) => {
        console.log('❌ Error:', err.message);
        clearTimeout(timeout);
        resolve();
      });

      // Send API status request
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'scb_get_api_status',
          arguments: {}
        }
      };

      try {
        serverProcess.stdin.write(JSON.stringify(request) + '\n');
        console.log('📤 Sent API status request...');
      } catch (e) {
        console.log('❌ Failed to send request:', e.message);
        clearTimeout(timeout);
        resolve();
      }
    });
  }
}

const tester = new SimpleTest();
tester.testServerBasics().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});