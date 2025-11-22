#!/usr/bin/env node

/**
 * Test script for SCB MCP API Client
 * Tests the fixed validation schemas and API endpoints
 */

import { SCBApiClient } from './dist/api-client.js';

const apiClient = new SCBApiClient();

console.log('🧪 Testing SCB MCP API Client\n');
console.log('=' .repeat(60));

// Test 1: Search tables (was failing due to type validation)
console.log('\n📋 Test 1: scb_search_tables (pension query)');
try {
  const result = await apiClient.searchTables({
    query: 'pension',
    pageSize: 3,
    lang: 'en'
  });

  console.log('✅ SUCCESS: scb_search_tables works!');
  console.log(`   Found ${result.tables.length} tables (total: ${result.page.totalElements})`);
  console.log('   Sample tables:');
  result.tables.forEach((table, idx) => {
    console.log(`   ${idx + 1}. ${table.id} - ${table.label.substring(0, 60)}...`);
  });
} catch (err) {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
}

// Test 2: Get config
console.log('\n⚙️  Test 2: scb_get_api_status (config endpoint)');
try {
  const config = await apiClient.getConfig();
  console.log('✅ SUCCESS: Config endpoint works!');
  console.log(`   API Version: ${config.apiVersion}`);
  console.log(`   Max Data Cells: ${config.maxDataCells.toLocaleString()}`);
  console.log(`   Rate Limit: ${config.maxCallsPerTimeWindow} calls per ${config.timeWindow}s`);
} catch (err) {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
}

// Test 3: Get table metadata
console.log('\n📊 Test 3: scb_get_table_info (metadata endpoint)');
try {
  const metadata = await apiClient.getTableMetadata('TAB1776', 'en');
  console.log('✅ SUCCESS: Metadata endpoint works!');
  console.log(`   Table: ${metadata.label}`);
  console.log(`   Variables: ${Object.keys(metadata.dimension || {}).join(', ')}`);
  console.log(`   Data size: ${(metadata.size || []).join(' x ')} cells`);
} catch (err) {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
}

// Test 4: Test validation of different queries
console.log('\n🔍 Test 4: Multiple search queries to verify schema stability');
const testQueries = ['population', 'economy', 'tjänstepension'];

for (const query of testQueries) {
  try {
    const result = await apiClient.searchTables({
      query,
      pageSize: 1,
      lang: 'en'
    });
    console.log(`   ✅ "${query}": Found ${result.page.totalElements} tables`);
  } catch (err) {
    console.error(`   ❌ "${query}": ${err.message}`);
    process.exit(1);
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ All tests passed! The API is working correctly.\n');

// Summary of fixes
console.log('📝 Fixes applied:');
console.log('   1. Made "type" field optional in TablesResponseSchema');
console.log('   2. Added deprecation notice for browse_folders endpoint');
console.log('   3. Both issues from the bug report are now resolved\n');
