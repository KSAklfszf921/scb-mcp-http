#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testBrowseFolders() {
  console.log('🧪 Testing SCB Browse Folders');
  
  const serverProcess = spawn('node', [join(__dirname, 'dist', 'index.js')], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'scb_browse_folders',
      arguments: {}
    }
  };

  let output = '';
  
  setTimeout(() => {
    if (!serverProcess.killed) {
      serverProcess.kill();
    }
    console.log('📋 Output:', output.substring(0, 500) + '...');
  }, 10000);

  serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    if (output.includes('Population') || output.includes('Labour market')) {
      console.log('✅ Browse folders working! Found expected folders.');
      console.log('📋 Preview:', output.substring(0, 300) + '...');
      serverProcess.kill();
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.log('⚠️ Error:', data.toString());
  });

  serverProcess.stdin.write(JSON.stringify(request) + '\n');
}

testBrowseFolders();