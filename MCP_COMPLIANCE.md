# MCP Compliance & Multi-Platform Support

Detta dokument beskriver hur SCB MCP Server följer Model Context Protocol-specifikationen och säkerställer kompatibilitet med olika AI-plattformar.

## JSON-RPC 2.0 Compliance

Servern följer [JSON-RPC 2.0-specifikationen](https://www.jsonrpc.org/specification) strikt:

### HTTP Status Codes

- **HTTP 200**: Används för alla giltiga JSON-RPC requests (både lyckade och error responses)
- **HTTP 204**: Används för notifications som inte kräver svar
- **HTTP 400**: Endast för transport-level errors (t.ex. ogiltig JSON)
- **HTTP 500**: Endast för server crashes

Detta följer JSON-RPC 2.0 best practices där HTTP-statuskoder är transport-concerns, medan JSON-RPC error codes hanterar application-level fel.

### Error Codes

Servern använder standardiserade JSON-RPC error codes:

| Kod | Namn | Användning |
|-----|------|------------|
| -32700 | Parse error | Ogiltig JSON i request body |
| -32600 | Invalid Request | Ogiltig JSON-RPC request |
| -32601 | Method not found | Okänd metod anropad |
| -32602 | Invalid params | Ogiltiga parametrar |
| -32603 | Internal error | Server-fel under exekvering |

## MCP Protocol Support

### Implementerade Metoder

- **initialize**: Handshake med klient, returnerar server capabilities
- **notifications/initialized**: Bekräftelse från klient (ingen response krävs)
- **tools/list**: Lista alla tillgängliga verktyg
- **tools/call**: Exekvera ett specifikt verktyg

### Capabilities

Servern deklarerar följande capabilities:

```json
{
  "tools": {},
  "resources": null,
  "prompts": null
}
```

Detta indikerar att servern stödjer tools men inte resources eller prompts.

## Multi-Platform Compatibility

### Testade Plattformar

SCB MCP Server är testad och fungerar med:

- **Claude Code** (CLI) - ✓
- **Claude Desktop** - ✓
- **ChatGPT Dev Mode** - ✓ (med MCP)
- **Gemini CLI** - ✓ (med MCP stöd)
- **Custom MCP clients** - ✓

### CORS Configuration

Servern har fullständigt CORS-stöd för web-baserade klienter:

```javascript
{
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}
```

### Transport Protocols

- **HTTP**: Primär transport via POST /mcp
- **GET /mcp**: Information endpoint
- **OPTIONS /mcp**: CORS preflight support

## Användarguide för Olika Plattformar

### Claude Code / Claude Desktop

```bash
claude mcp add --transport http scb-statistics https://scb-mcp-http.onrender.com/mcp
```

### ChatGPT Dev Mode

Konfigurera i MCP settings:
```json
{
  "mcpServers": {
    "scb": {
      "url": "https://scb-mcp-http.onrender.com/mcp",
      "transport": "http"
    }
  }
}
```

### Custom Implementation

```javascript
// Exempel med fetch API
const response = await fetch('https://scb-mcp-http.onrender.com/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  })
});

const { result } = await response.json();
console.log(result.tools); // Lista av 11 verktyg
```

## Felhantering

Servern hanterar alla fel enligt JSON-RPC 2.0-spec och returnerar strukturerade error responses:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Method not found: unknown_method"
  }
}
```

## Referenser

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [MCP Server Concepts](https://modelcontextprotocol.io/docs/learn/server-concepts)
- [MCP Client Development](https://modelcontextprotocol.io/docs/develop/build-client)
