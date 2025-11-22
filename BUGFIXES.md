# Bug Fixes & Validation Testing

This document records critical bugs discovered and fixed in the SCB MCP server, along with the automated tests created to prevent regressions.

## 🐛 Critical Bugs Fixed (2025-10-18)

### Bug #1: `scb_search_tables` - Validation Error on Type Field

**Severity:** 🔴 **CRITICAL** - Completely blocked table search functionality

**Symptoms:**
```
Error: Invalid literal value, expected "Table"
Path: tables[0-19].type
```

**Root Cause:**
The TypeScript schema in `src/types.ts` expected a `type: "Table"` field in table objects, but the SCB API v2 **does not return this field**. This was a breaking change between API v1 and v2.

**API Response (actual):**
```json
{
  "id": "TAB1776",
  "label": "Pensions (ESA2010)...",
  "description": "",
  "updated": "2023-12-20T07:00:00Z",
  "category": "public",
  // NOTE: No "type" field!
  ...
}
```

**Schema (expected):**
```typescript
type: z.literal('Table'),  // ❌ This field doesn't exist in API v2!
```

**Fix Applied:**
Made the `type` field optional in `src/types.ts:64`:
```typescript
type: z.literal('Table').optional(),  // ✅ Now optional - allows API v2 responses
```

**Verification:**
```bash
# Test the fix
node test-api.mjs

# Output:
✅ SUCCESS: scb_search_tables works!
Found 3 tables (total: 174)
```

**Prevention:**
- Added automated test in `tests/api-validation.test.mjs`
- Test specifically validates that responses without `type` field are accepted
- Documentation added to schema explaining the v2 change

---

### Bug #2: `scb_browse_folders` - 404 Not Found

**Severity:** 🔴 **CRITICAL** - Feature completely non-functional

**Symptoms:**
```
Error: API request failed: 404 Not Found
```

**Root Cause:**
The `/navigation` endpoint was **completely removed** in SCB API v2 (PxWebApi 2.0). The MCP server was trying to call an endpoint that no longer exists.

**Evidence:**
```bash
$ curl -i "https://api.scb.se/OV0104/v2beta/api/v2/navigation?lang=en"
HTTP/1.1 404 Not Found
```

**API Specification:**
Checked the [official PxAPI-2.yml spec](https://github.com/statisticssweden/PxApiSpecs/blob/master/PxAPI-2.yml) - **no `/navigation` endpoint exists**.

**Fix Applied:**
Modified `src/index.ts:388-414` to return a helpful error message instead of trying to call the non-existent endpoint:

```typescript
private async handleBrowseFolders(args: { folderId?: string; language?: string }) {
  // NOTE: The /navigation endpoint has been removed in SCB API v2
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        error: {
          type: "feature_not_available",
          message: "The browse_folders feature is not available in SCB API v2",
          details: "The /navigation endpoint has been removed in PxWebApi 2.0",
          alternatives: [
            "Use scb_search_tables to find tables by keyword",
            "Search by category using the category parameter",
            "Browse tables by subject using the 'paths' field in search results"
          ],
          documentation: "https://www.scb.se/en/services/open-data-api/pxwebapi/pxapi-2.0"
        }
      }, null, 2)
    }]
  };
}
```

**Verification:**
The tool now returns a structured error with helpful alternatives instead of crashing.

**Migration Path:**
Users should use:
1. `scb_search_tables` with category filters for organized browsing
2. The `paths` field in search results shows hierarchical folder structure
3. Targeted keyword searches instead of folder navigation

---

## 🧪 Automated Test Suite

### Test Files

1. **`test-api.mjs`** - Quick validation test
   - Runs 4 basic checks
   - Verifies core functionality works
   - Fast execution (~5 seconds)

2. **`tests/api-validation.test.mjs`** - Comprehensive test suite
   - 13 test cases across 4 suites
   - Schema validation tests
   - API endpoint functionality tests
   - Error handling tests
   - Edge case & regression tests

### Running Tests

```bash
# Quick test
node test-api.mjs

# Comprehensive test suite
node tests/api-validation.test.mjs

# Run with npm
npm run build && node tests/api-validation.test.mjs
```

### Test Coverage

#### Suite 1: Schema Validation Tests
✅ Verifies schemas accept API v2 responses without "type" field
✅ Validates all required fields are present
✅ Tests config response schema
✅ Tests dataset/metadata schema

#### Suite 2: API Endpoint Functionality
✅ Search tables with query parameter
✅ Search tables without query (list all)
✅ Get table metadata
✅ Get API configuration

#### Suite 3: Error Handling
✅ Invalid table ID returns meaningful error
✅ Rate limit tracking works correctly

#### Suite 4: Edge Cases & Regression Tests
✅ Multiple sequential searches maintain stability
✅ Optional fields handled correctly
✅ Pagination works correctly

### Example Test Output

```
🧪 SCB MCP API Validation Test Suite
======================================================================

📋 Suite 1: Schema Validation Tests
Testing that schemas correctly validate SCB API v2 responses

  TablesResponseSchema accepts responses without "type" field... ✅ PASS
  TablesResponseSchema validates all required fields... ✅ PASS
  ConfigResponseSchema validates API config... ✅ PASS
  DatasetSchema validates table metadata... ✅ PASS

...

======================================================================
📊 Test Results Summary

   Total Tests: 13
   ✅ Passed: 13
   ❌ Failed: 0
   Success Rate: 100%

✅ All tests passed successfully!
```

---

## 📋 Testing Checklist

When making changes to SCB API integration, always:

- [ ] Run the quick test: `node test-api.mjs`
- [ ] Run comprehensive tests: `node tests/api-validation.test.mjs`
- [ ] Rebuild after code changes: `npm run build`
- [ ] Test with real Claude Desktop integration
- [ ] Check that error messages are helpful
- [ ] Verify schema changes don't break existing functionality

---

## 🔍 How to Diagnose Similar Issues

### 1. Check the actual API response
```bash
curl -s "https://api.scb.se/OV0104/v2beta/api/v2/tables?query=pension&pageSize=1&lang=en" | head -100
```

### 2. Compare with schema definition
```typescript
// Check src/types.ts for the expected schema
export const TablesResponseSchema = z.object({
  // Compare each field with actual API response
});
```

### 3. Check API specification
- Official spec: https://github.com/statisticssweden/PxApiSpecs/blob/master/PxAPI-2.yml
- Download and grep for endpoints: `grep -n "navigation" PxAPI-2.yml`

### 4. Validate with Zod
```typescript
try {
  const validated = TablesResponseSchema.parse(apiResponse);
} catch (error) {
  console.log('Validation error:', error.issues);
}
```

---

## 📚 References

- **API Documentation**: https://www.scb.se/en/services/open-data-api/pxwebapi/pxapi-2.0
- **API Specification**: https://github.com/statisticssweden/PxApiSpecs/blob/master/PxAPI-2.yml
- **Zod Documentation**: https://zod.dev/
- **MCP Protocol**: https://modelcontextprotocol.io/

---

## 🎯 Key Learnings

1. **Always test against actual API responses**, not assumptions
2. **API v2 is not backwards compatible** - schemas must be updated
3. **Optional fields prevent breaking changes** when APIs evolve
4. **Comprehensive tests prevent regressions** when fixing bugs
5. **Document API changes** for future maintainers

---

*Last Updated: 2025-10-18*
*Bugs Fixed: 2*
*Tests Added: 13*
*Test Success Rate: 100%*
