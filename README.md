# SCB MCP Server

En Model Context Protocol (MCP) server för åtkomst till Statistiska centralbyråns (SCB) öppna data via PX-Web API v2.

## Översikt

SCB MCP Server möjliggör integration mellan AI-assistenter (Claude, ChatGPT, etc.) och SCBs omfattande statistikdatabas. Servern tillhandahåller strukturerad åtkomst till svensk officiell statistik inom områden som befolkning, ekonomi, arbetsmarknad och utbildning.

### Funktioner

- Sök och navigera bland tusentals statistiktabeller
- Hämta data med intelligent filtrering och validering
- Automatisk översättning av variabelnamn mellan svenska och engelska
- Förhandsvalidering av queries för att undvika API-fel
- Stöd för regionkoder och geografisk data
- HTTP transport med fullständigt MCP-protokollstöd

## Installation

### Förutsättningar

- Node.js 18.0.0 eller senare
- npm eller yarn

### Lokal installation

```bash
git clone https://github.com/KSAklfszf921/scb-mcp-http.git
cd scb-mcp-http
npm install
npm run build
```

### Starta servern

```bash
# Starta HTTP-server (standard port 3000)
npm start

# Alternativt med custom port
PORT=8080 npm start
```

## Användning

### Med Claude Desktop

Lägg till i din Claude Desktop-konfiguration:

```json
{
  "mcpServers": {
    "scb-statistics": {
      "type": "http",
      "url": "https://scb-mcp-http.onrender.com/mcp"
    }
  }
}
```

### Med Claude Code CLI

```bash
claude mcp add --transport http scb-statistics https://scb-mcp-http.onrender.com/mcp
```

### Med andra MCP-klienter

Servern är tillgänglig via HTTP på:
- **Produktions-URL**: `https://scb-mcp-http.onrender.com/mcp`
- **Lokal utveckling**: `http://localhost:3000/mcp`

## Tillgängliga funktioner

### Verktyg (Tools)

Servern tillhandahåller 11 verktyg för direkt interaktion med SCB:s data:

| Verktyg | Beskrivning |
|---------|-------------|
| `scb_get_api_status` | Hämta API-konfiguration och rate limits |
| `scb_search_tables` | Sök statistiktabeller |
| `scb_get_table_info` | Hämta metadata för specifik tabell |
| `scb_get_table_variables` | Lista tillgängliga variabler och värden |
| `scb_get_table_data` | Hämta statistikdata |
| `scb_preview_data` | Förhandsgranska data (begränsad mängd) |
| `scb_test_selection` | Validera en data-selektion |
| `scb_find_region_code` | Hitta regionkod för kommun/län |
| `scb_search_regions` | Sök efter regioner |
| `scb_check_usage` | Kontrollera API-användning |
| `scb_browse_folders` | Bläddra databasmappar (deprecated) |

### Promptmallar (Prompts)

Servern erbjuder 6 promptmallar för vanliga analysuppgifter:

| Prompt | Beskrivning | Argument |
|--------|-------------|----------|
| `analyze-regional-statistics` | Analysera regional statistik för kommun/län | `region_name`, `topic`, `time_period` |
| `compare-municipalities` | Jämför statistik mellan kommuner | `municipalities`, `metric`, `year` |
| `find-statistics-table` | Hjälp att hitta rätt SCB-tabell | `topic`, `region_type`, `time_period` |
| `build-custom-query` | Steg-för-steg guide för komplex query | `table_id`, `description` |
| `employment-trend-analysis` | Analysera sysselsättnings-/arbetslöshetstrend | `region`, `months` |
| `population-demographics` | Hämta demografisk information | `region`, `breakdown` |

Promptmallar aktiveras explicit av användaren och ger strukturerade arbetsflöden för vanliga uppgifter.

## Exempel

### Söka efter tabeller

```javascript
{
  "tool": "scb_search_tables",
  "arguments": {
    "query": "befolkning",
    "pageSize": 10,
    "language": "sv"
  }
}
```

### Hämta data

```javascript
{
  "tool": "scb_get_table_data",
  "arguments": {
    "tableId": "TAB4422",
    "selection": {
      "Region": ["01"],
      "ContentsCode": ["*"],
      "Tid": ["2024"]
    },
    "language": "sv"
  }
}
```

### Använda promptmallar

```javascript
{
  "prompt": "analyze-regional-statistics",
  "arguments": {
    "region_name": "Göteborg",
    "topic": "arbetslöshet",
    "time_period": "2024"
  }
}
```

Detta genererar en strukturerad guide som använder flera verktyg för att analysera arbetslöshet i Göteborg.

## Deployment

### Render

1. Skapa ny Web Service på [render.com](https://render.com)
2. Koppla till GitHub-repot
3. Konfigurera:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

### Vercel/Railway/Fly.io

Servern fungerar på alla plattformar som stöder Node.js HTTP-servrar. Använd `npm start` som startkommando.

## Teknisk information

- **Protokoll**: Model Context Protocol (MCP) v2024-11-05
- **Transport**: HTTP med CORS-stöd
- **Autentisering**: Ingen (SCBs API är öppet)
- **API-version**: SCB PX-Web API v2.0
- **Rate limits**: 30 anrop per 10 sekunder (SCB-begränsning)

## Licens

MIT

## Relaterade länkar

- [SCB PX-Web API dokumentation](https://www.scb.se/en/services/open-data-api/api-for-the-statistical-database/)
- [Model Context Protocol specifikation](https://modelcontextprotocol.io/)
- [Render deployment-guide](https://render.com/docs)

## Support

För frågor eller problem, öppna en issue på GitHub.
