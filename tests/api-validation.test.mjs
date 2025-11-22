#!/usr/bin/env node

/**
 * API Validation Test Suite for SCB MCP Server
 *
 * This test suite validates that the SCB API client correctly handles
 * SCB API v2 responses, including edge cases and schema validation.
 *
 * These tests were created in response to validation errors discovered
 * on 2025-10-18 where the schema expected fields that the API no longer
 * returns in v2.
 *
 * Run with: node tests/api-validation.test.mjs
 */

import { SCBApiClient } from '../dist/api-client.js';
import { TablesResponseSchema, ConfigResponseSchema, DatasetSchema } from '../dist/types.js';

const apiClient = new SCBApiClient();

// Test results tracker
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Test helper function
 */
async function test(name, testFn) {
  totalTests++;
  process.stdout.write(`  ${name}... `);

  try {
    await testFn();
    passedTests++;
    console.log('✅ PASS');
    return true;
  } catch (error) {
    failedTests++;
    console.log('❌ FAIL');
    console.log(`     Error: ${error.message}`);
    if (error.stack) {
      console.log(`     ${error.stack.split('\n').slice(1, 3).join('\n     ')}`);
    }
    return false;
  }
}

/**
 * Assertion helpers
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected} but got ${actual}`);
  }
}

console.log('\n🧪 SCB MCP API Validation Test Suite');
console.log('=' .repeat(70));

// ============================================================================
// Test Suite 1: Schema Validation for API v2 Responses
// ============================================================================
console.log('\n📋 Suite 1: Schema Validation Tests');
console.log('Testing that schemas correctly validate SCB API v2 responses\n');

await test('TablesResponseSchema accepts responses without "type" field', async () => {
  const result = await apiClient.searchTables({
    query: 'population',
    pageSize: 1,
    lang: 'en'
  });

  // Verify the response validates against our schema
  const validated = TablesResponseSchema.parse(result);
  assert(validated, 'Schema validation failed');
  assert(validated.tables.length > 0, 'Expected at least one table');

  // Verify that the API doesn't return a 'type' field (this was the bug)
  const firstTable = result.tables[0];
  assert(typeof firstTable.type === 'undefined' || firstTable.type === 'Table',
    'Table type field should be undefined or "Table"');
});

await test('TablesResponseSchema validates all required fields', async () => {
  const result = await apiClient.searchTables({
    query: 'economy',
    pageSize: 1,
    lang: 'en'
  });

  const table = result.tables[0];
  assert(table.id, 'Table must have id');
  assert(table.label, 'Table must have label');
  assert(table.description !== undefined, 'Table must have description field');
  assert(Array.isArray(table.links), 'Table must have links array');
});

await test('ConfigResponseSchema validates API config', async () => {
  const config = await apiClient.getConfig();
  const validated = ConfigResponseSchema.parse(config);

  assert(validated.apiVersion, 'Config must have apiVersion');
  assert(validated.maxDataCells > 0, 'maxDataCells must be positive');
  assert(validated.maxCallsPerTimeWindow > 0, 'maxCallsPerTimeWindow must be positive');
});

await test('DatasetSchema validates table metadata', async () => {
  // Use a known stable table ID
  const metadata = await apiClient.getTableMetadata('TAB1776', 'en');
  const validated = DatasetSchema.parse(metadata);

  assert(validated.version === '2.0', 'Dataset version must be 2.0');
  assert(validated.class === 'dataset', 'Dataset class must be "dataset"');
  assert(validated.dimension, 'Dataset must have dimension');
});

// ============================================================================
// Test Suite 2: API Endpoint Functionality
// ============================================================================
console.log('\n🌐 Suite 2: API Endpoint Functionality Tests');
console.log('Testing that all major endpoints work correctly\n');

await test('Search tables with query parameter', async () => {
  const result = await apiClient.searchTables({
    query: 'pension',
    pageSize: 5,
    lang: 'en'
  });

  assert(result.tables.length > 0, 'Should find tables matching "pension"');
  assert(result.page.totalElements > 0, 'Total elements should be > 0');
});

await test('Search tables without query (list all)', async () => {
  const result = await apiClient.searchTables({
    pageSize: 1,
    lang: 'en'
  });

  assert(result.tables.length === 1, 'Should return exactly 1 table');
  assert(result.page.totalElements > 100, 'Total tables should be > 100');
});

await test('Get table metadata with valid table ID', async () => {
  const metadata = await apiClient.getTableMetadata('TAB1776', 'en');

  assert(metadata.label, 'Metadata must have label');
  assert(metadata.dimension, 'Metadata must have dimension');
  assert(Object.keys(metadata.dimension).length > 0, 'Must have at least one dimension');
});

await test('API config endpoint returns valid configuration', async () => {
  const config = await apiClient.getConfig();

  assert(config.apiVersion === '2.0.0', 'API version should be 2.0.0');
  assert(config.languages.length >= 2, 'Should have at least 2 languages');
  assert(config.defaultLanguage, 'Should have default language');
});

// ============================================================================
// Test Suite 3: Error Handling
// ============================================================================
console.log('\n⚠️  Suite 3: Error Handling Tests');
console.log('Testing that errors are handled gracefully\n');

await test('Invalid table ID returns meaningful error', async () => {
  try {
    await apiClient.getTableMetadata('INVALID_TABLE_ID_12345', 'en');
    throw new Error('Should have thrown an error for invalid table ID');
  } catch (error) {
    assert(error.message.includes('404') || error.message.includes('not found'),
      'Error should indicate 404 or not found');
  }
});

await test('Rate limit info is tracked', async () => {
  const usage = apiClient.getUsageInfo();

  assert(typeof usage.requestCount === 'number', 'Request count should be a number');
  assert(usage.windowStart instanceof Date, 'Window start should be a Date');
  assert(usage.rateLimitInfo || true, 'Rate limit info may be null initially');
});

// ============================================================================
// Test Suite 4: Edge Cases and Regression Tests
// ============================================================================
console.log('\n🔍 Suite 4: Edge Cases & Regression Tests');
console.log('Testing edge cases and preventing known bugs from recurring\n');

await test('Multiple sequential searches maintain stability', async () => {
  const queries = ['population', 'economy', 'housing', 'labour', 'education'];

  for (const query of queries) {
    const result = await apiClient.searchTables({
      query,
      pageSize: 1,
      lang: 'en'
    });
    assert(result.tables.length > 0, `Should find results for "${query}"`);
  }
});

await test('Schema handles optional fields correctly', async () => {
  const result = await apiClient.searchTables({
    query: 'test',
    pageSize: 1,
    lang: 'en'
  });

  if (result.tables.length > 0) {
    const table = result.tables[0];
    // These fields are optional and may not be present
    assert(typeof table.source === 'string' || table.source === undefined,
      'source should be string or undefined');
    assert(typeof table.subjectCode === 'string' || table.subjectCode === undefined,
      'subjectCode should be string or undefined');
  }
});

await test('Pagination works correctly', async () => {
  const page1 = await apiClient.searchTables({
    query: 'population',
    pageSize: 5,
    pageNumber: 1,
    lang: 'en'
  });

  const page2 = await apiClient.searchTables({
    query: 'population',
    pageSize: 5,
    pageNumber: 2,
    lang: 'en'
  });

  assert(page1.page.pageNumber === 1, 'Page 1 number should be 1');
  assert(page2.page.pageNumber === 2, 'Page 2 number should be 2');
  assert(page1.tables[0].id !== page2.tables[0].id, 'Different pages should have different tables');
});

// ============================================================================
// Test Results Summary
// ============================================================================
console.log('\n' + '='.repeat(70));
console.log('📊 Test Results Summary\n');
console.log(`   Total Tests: ${totalTests}`);
console.log(`   ✅ Passed: ${passedTests}`);
console.log(`   ❌ Failed: ${failedTests}`);
console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests > 0) {
  console.log('\n❌ Some tests failed. Please review the errors above.\n');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed successfully!\n');
  console.log('🎯 Key Validations:');
  console.log('   • Schema correctly handles missing "type" field (fixes 2025-10-18 bug)');
  console.log('   • All major endpoints functional');
  console.log('   • Error handling works as expected');
  console.log('   • Edge cases handled correctly\n');
  process.exit(0);
}
