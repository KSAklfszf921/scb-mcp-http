<img width="640" height="320" alt="MCP SERVER" src="https://github.com/user-attachments/assets/8183270f-cc19-4513-a26b-c8c18e60f1d8" />

[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-Published-brightgreen)](https://registry.modelcontextprotocol.io/servers/io.github.isakskogstad/scb-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) 
[![Server Status](https://img.shields.io/website?url=https://scb-mcp.onrender.com%2Fhealth&label=Server%20Status&up_message=online&down_message=offline)](https://riksdag-regering-ai.onrender.com/health)
[![MCP Protocol](https://img.shields.io/badge/MCP%20Protocol-2024--11--05-blue?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIi8+CiAgPHBhdGggZD0iTTEyIDJMMiA3VjE3TDEyIDIyTDIyIDE3VjdMMTIgMloiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=)](https://modelcontextprotocol.io/)

# 📊 SCB MCP Server


SCB MCP är server som LLM:s och AI-chatbotar kan använda för att söka, hitta och hämta officiell data och statistik från Statistikbyrån (SCB). Det omfattar 1 200+ statistiktabeller med data om befolkning & demografi, ekonomi & finans, miljö, arbetsmarknad, utbildning och transport. Perfekt för att bygga interaktiva instrumentpaneler, forskningsverktyg och utbildningsapplikationer.

---


## Översikt
<details>
<summary><strong>🇬🇧 Overview </strong></summary>

The SCB MCP server provides seamless integration with **Statistics Sweden's PxWebAPI 2.0**, enabling LLM:s to access:

- **Population & Demographics**: Regional data, migrations, births, deaths (312+ regions)
- **Economy & Finance**: GDP, taxes, business statistics, national accounts
- **Environment**: Greenhouse gas emissions, water/waste management, sustainability metrics
- **Labor Market**: Employment, unemployment, occupational data, skills matching
- **Education**: Student statistics, course enrollments, skills development

Data ranges from 1950s to present (monthly/quarterly updates). Real-time population statistics updated to November 2025.

</details>
SCB MCP-servern ger sömlös integrering med Statistikbyråns (SCB) PxWebAPI 2.0, vilket gör det möjligt för LLM:s att tillgå:

- **Befolkning & demografi**: Regionaldata, migrationer, födslar, dödsfall (312+ regioner)
- **Ekonomi & finans**: BNP, skatter, företagsstatistik, nationalräkenskaper
- **Miljö**: Växthusgaser, vatten/avfallshantering, hållbarhetsvärdena
- **Arbetsmarknad**: Sysselsättning, arbetslöshet, yrkesdata, kompetensmatchning
- **Utbildning**: Studentstatistik, kursanmälningar, kompetensutveckling

---

<details>
<summary><strong>🇬🇧 Key features (English)</strong></summary>

| Feature | Description |
|---------|-------------|
| **Comprehensive Access** | 1,200+ tables, 312+ regions, 75+ years of historical data |
| **Smart Querying** | Natural language search, region code resolution ("Lerum" → 1441), TOP() & wildcard support |
| **Fuzzy Matching** | "Goteborg" matches "Göteborg", "Malmo" matches "Malmö" |
| **Developer-Friendly** | Full documentation, clear errors with suggestions, selection validation, metadata in responses |
| **Production-Ready** | Rate limiting (30 req/10s), consistent behavior, proper data types, language support (SV/EN) |
| **Swedish by Default** | All tools use Swedish (sv) as default for best search results |
| **Real-Time Data** | Monthly/quarterly updates, population data to November 2025 |

</details>

## Huvudfunktioner

| Funktion | Beskrivning |
|----------|-------------|
| **Omfattande åtkomst** | 1 200+ tabeller, 312+ regioner, 75+ års historiska data |
| **Smart sökning** | Naturspråkig sökning, regionkodupplösning ("Lerum" → 1441), TOP() & wildcard-stöd |
| **Fuzzy matching** | "Goteborg" matchar "Göteborg", "Malmo" matchar "Malmö" |
| **Utvecklarvänlig** | Fullständig dokumentation, tydliga felmeddelanden, valideringsmöjligheter, metadata i svaren |
| **Produktionsklar** | Rate limiting (30 req/10s), konsekvent beteende, rätt datatyper, språkstöd (SV/EN) |
| **Svenska som standard** | Alla verktyg använder svenska (sv) som default för bästa sökresultat |
| **Aktuell data** | Månatliga/kvartalsvisa uppdateringar, befolkningsdata till november 2025 |

---

## 🚀 Snabbstart

> **Enklaste sättet**: Använd den redan hostade servern — ingen installation behövs!

**MCP remote URL**: `https://scb-mcp.onrender.com/mcp`

Lägg till denna konfiguration i din MCP-värd:

```json
{
  "mcpServers": {
    "scb": {
      "type": "http",
      "url": "https://scb-mcp.onrender.com/mcp"
    }
  }
}
```

✅ **Klart!** Du har nu tillgång till alla 1 200+ svenska statistiktabeller.

<details>
<summary><strong>🇬🇧 Quick start (English)</strong></summary>

> **Easiest way**: Use the already hosted server — no installation needed!

**MCP remote URL**: `https://scb-mcp.onrender.com/mcp`

Add this configuration to your MCP host:

```json
{
  "mcpServers": {
    "scb": {
      "type": "http",
      "url": "https://scb-mcp.onrender.com/mcp"
    }
  }
}
```

✅ **Done!** You now have access to all 1,200+ Swedish statistical tables.

</details>

---

## Installation & inställning

### Alternativ 1: Remote URL (ingen installation)

Använd den hostade servern direkt - fungerar med alla MCP-kompatibla klienter:

**URL:** `https://scb-mcp.onrender.com/mcp`

| Klient | Hur du ansluter |
|--------|-----------------|
| **GitHub Copilot** (VS Code) | Lägg till i `.vscode/mcp.json` (se nedan) |
| **ChatGPT** (Dev Mode) | Lägg till MCP server URL: `https://scb-mcp.onrender.com/mcp` |
| **Claude Web** | Lägg till MCP server: `https://scb-mcp.onrender.com/mcp` |
| **Gemini** | Konfigurera HTTP MCP endpoint |
| **Custom** | POST till `/mcp` med JSON-RPC 2.0 |

#### GitHub Copilot (VS Code)

Skapa `.vscode/mcp.json` i ditt projekt:

```json
{
  "servers": {
    "scb": {
      "type": "http",
      "url": "https://scb-mcp.onrender.com/mcp"
    }
  }
}
```

Eller använd Command Palette: `MCP: Add Server` och välj HTTP-typ.

Ingen autentisering krävs. CORS är aktiverat för alla domäner.

---

### Alternativ 2: Lokal installation (Node.js)

För Claude Code, terminal-klienter eller egen hosting:

```bash
# Klona repository
git clone https://github.com/isakskogstad/SCB-MCP.git
cd SCB-MCP

# Installera och bygg
npm install
npm run build
```

#### Claude Code (CLI)

```bash
claude mcp add scb-mcp -- node /sökväg/till/SCB-MCP/dist/index.js
```

#### MCP-konfiguration (stdio)

Lägg till i `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "scb": {
      "command": "node",
      "args": ["/sökväg/till/SCB-MCP/dist/index.js"],
      "type": "stdio"
    }
  }
}
```

#### Kör egen HTTP-server

```bash
npm run start  # Startar på port 3000
# eller
PORT=8080 npm run start
```

---

### Alternativ 3: Docker

```bash
docker build -t scb-mcp .
docker run -p 3000:3000 scb-mcp
```

---

<details>
<summary><strong>🇬🇧 Installation & setup (English)</strong></summary>

### Option 1: Remote URL (no installation)

Use the hosted server directly - works with all MCP-compatible clients:

**URL:** `https://scb-mcp.onrender.com/mcp`

| Client | How to connect |
|--------|----------------|
| **ChatGPT** (Dev Mode) | Add MCP server URL: `https://scb-mcp.onrender.com/mcp` |
| **Claude Web** | Add MCP server: `https://scb-mcp.onrender.com/mcp` |
| **Gemini** | Configure HTTP MCP endpoint |
| **Custom** | POST to `/mcp` with JSON-RPC 2.0 |

No authentication required. CORS enabled for all origins.

---

### Option 2: Local installation (Node.js)

For Claude Code, terminal clients or self-hosting:

```bash
git clone https://github.com/isakskogstad/SCB-MCP.git
cd SCB-MCP
npm install
npm run build
```

#### Claude Code (CLI)

```bash
claude mcp add scb-mcp -- node /path/to/SCB-MCP/dist/index.js
```

#### MCP configuration (stdio)

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "scb": {
      "command": "node",
      "args": ["/path/to/SCB-MCP/dist/index.js"],
      "type": "stdio"
    }
  }
}
```

#### Run your own HTTP server

```bash
npm run start  # Starts on port 3000
# or
PORT=8080 npm run start
```

---

### Option 3: Docker

```bash
docker build -t scb-mcp .
docker run -p 3000:3000 scb-mcp
```

</details>

---

## Användarguide

### 1. Sök efter statistiktabeller

```python
# Hitta befolkningsrelaterade tabeller
results = scb.search_tables(query="befolkning statistik", limit=10)

# Filtrera efter kategori
results = scb.search_tables(query="miljö", category="environment", limit=5)
```

<details>
<summary><strong>🇬🇧 Usage guide (English)</strong></summary>

### 1. Search for statistical tables

```python
results = scb.search_tables(query="population", limit=10)
results = scb.search_tables(query="environment", category="environment", limit=5)
```

</details>

---

### 2. Hitta regionkoder

```python
# Lerum kommun
region = scb.find_region_code(query="Lerum")
# Returnerar: code="1441", name="Lerum"

# Större regioner
region = scb.find_region_code(query="Stockholm")
# Returnerar: code="01" (län), code="0180" (kommun)

# Fuzzy matching - fungerar utan svenska tecken
region = scb.find_region_code(query="Goteborg")
# Returnerar: code="1480", name="Göteborg"
```

<details>
<summary><strong>🇬🇧 Resolve region codes (English)</strong></summary>

```python
region = scb.find_region_code(query="Lerum")
region = scb.find_region_code(query="Stockholm")

# Fuzzy matching - works without Swedish characters
region = scb.find_region_code(query="Goteborg")
# Returns: code="1480", name="Göteborg"
```

</details>

---

### 3. Hämta data

```python
# Medelålder i Lerum 2024
data = scb.get_table_data(
    tableId="TAB637",
    selection={
        "Region": ["1441"],
        "Kon": ["1+2"],
        "Tid": ["2024"],
        "ContentsCode": ["BE0101G9"]
    }
)
# Resultat: Medelålder i Lerum 2024: 40.1 år
```

<details>
<summary><strong>🇬🇧 Fetch data (English)</strong></summary>

```python
data = scb.get_table_data(
    tableId="TAB637",
    selection={
        "Region": ["1441"],
        "Kon": ["1+2"],
        "Tid": ["2024"],
        "ContentsCode": ["BE0101G9"]
    }
)
```

</details>

---

## Best practices

| Problem | Lösning |
|---------|---------|
| **Stor datamängd?** | Använd alltid `preview_data()` först för att testa |
| **För mycket data?** | Använd `"TOP(5)"` istället för `"*"` för tidsperioder |
| **Felaktiga koder?** | Anropa `get_table_variables()` först — koder varierar mellan tabeller |
| **Osäker på enheter?** | Kontrollera variabeletikett för enheter (kt, ton, procent osv.) |

<details>
<summary><strong>🇬🇧 Best practices (English)</strong></summary>

| Issue | Solution |
|-------|----------|
| **Large dataset?** | Always use `preview_data()` first to test |
| **Too much data?** | Use `"TOP(5)"` instead of `"*"` for time periods |
| **Wrong codes?** | Call `get_table_variables()` first — codes vary between tables |
| **Unsure about units?** | Check variable label for units (kt, tonnes, percent, etc.) |

</details>

---

## Praktiska exempel

### Ex: Befolkningstrend Lerum vs Stockholm

```python
# Jämför två regioner över tid
data = scb.get_table_data(
    tableId="TAB637",
    selection={
        "Region": ["1441", "0180"],  # Lerum och Stockholm
        "Kon": ["1+2"],
        "Tid": ["TOP(5)"],
        "ContentsCode": ["BE0101G9"]
    }
)
# Stockholm: 41.0 år (2024), Lerum: 40.1 år (2024)
# Trend: Stockholm åldras snabbare
```

<details>
<summary><strong>🇬🇧 Example 1: Population trends (English)</strong></summary>

```python
data = scb.get_table_data(
    tableId="TAB637",
    selection={
        "Region": ["1441", "0180"],  # Lerum and Stockholm
        "Kon": ["1+2"],
        "Tid": ["TOP(5)"],
        "ContentsCode": ["BE0101G9"]
    }
)
# Stockholm: 41.0 years (2024), Lerum: 40.1 years (2024)
```

</details>

---

## Resurser

- **SCB-databas**: https://www.scb.se/
- **API-dokumentation**: https://www.scb.se/en/services/open-data-api/pxwebapi/
- **Dataexplorer**: https://pxweb.scb.se/pxweb/en/

---

**Av: Isak Skogstad** 
