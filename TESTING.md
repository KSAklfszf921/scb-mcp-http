# Testing the SCB MCP Server

## Quick Test Setup

1. **Build the project:**
```bash
npm install
npm run build
```

2. **Run the automated test suite:**
```bash
npm run test-tools
```

## Test Scripts Available

### 1. Automated Test Suite (`test-tools.js`)
Comprehensive testing of all tools:
```bash
npm run test-tools
```

**What it tests:**
- ✅ Tool discovery and listing
- ✅ API configuration and rate limits  
- ✅ Database navigation (root and folders)
- ✅ Table search functionality
- ✅ Table metadata retrieval
- ✅ Data fetching with filtering
- ✅ Usage monitoring throughout

### 2. Manual Testing (`manual-test.js`)
Test individual tools step-by-step:
```bash
node manual-test.js
```

**Edit the script** to uncomment specific tests you want to run.

## Expected Test Results

### ✅ Successful Test Output:
```
🧪 [12:34:56] Testing scb_get_api_status
✅ [12:34:57] scb_get_api_status succeeded
📋 [12:34:57] Response preview: **SCB API Status**

**Configuration:**
- API Version: 2.0
- Default Language: en
- Available Languages: en (English), sv (Svenska)...
```

### ❌ Common Issues and Solutions:

**"Build not found"**
```bash
npm run build
```

**"Rate limit exceeded"**
- Wait 10 seconds and try again
- The API typically allows ~30 requests per 10-second window

**"Request timeout"**
- Check internet connection
- SCB API might be temporarily unavailable

**"Table not found" errors**
- Normal - some test table IDs may not exist
- The test will try multiple common table IDs

## Testing Individual Tools

### Test API Status:
```javascript
await testSingleTool('scb_get_api_status');
```

### Test Navigation:
```javascript
await testSingleTool('scb_browse_folders'); // Root
await testSingleTool('scb_browse_folders', { folderId: 'BE' }); // Population
```

### Test Search:
```javascript
await testSingleTool('scb_search_tables', { 
  query: 'population', 
  pageSize: 5 
});
```

### Test Data Access:
```javascript
await testSingleTool('scb_get_table_info', { tableId: 'BE0101N1' });
await testSingleTool('scb_get_table_data', { tableId: 'BE0101N1' });
```

## Rate Limit Testing

The server includes rate limit protection. To test it:

1. Run multiple tests quickly
2. Check usage with: `scb_check_usage`
3. Try to exceed limits (should get clear error messages)

## Integration Testing with Claude Desktop

After the tools pass testing:

1. Add to Claude Desktop MCP config:
```json
{
  "mcpServers": {
    "scb-statistics": {
      "command": "node",
      "args": ["C:\\path\\to\\scb-mcp\\dist\\index.js"]
    }
  }
}
```

2. Restart Claude Desktop

3. Try queries like:
   - "What's the API status for Swedish statistics?"
   - "Show me population tables"
   - "Get data about Swedish unemployment"

## Debugging Tips

- **Check logs**: The test scripts show detailed request/response data
- **Rate limits**: Use `scb_check_usage` to monitor API quota
- **Network issues**: SCB API requires internet connection
- **Table IDs**: Some test table IDs may change - check SCB website for current IDs

## Performance Notes

- First API call may be slower (initializing rate limit tracking)
- Large data requests may take 10-30 seconds
- The API has a 10,000 data cell limit per request