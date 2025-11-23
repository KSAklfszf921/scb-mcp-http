# Ändringslogg

Alla viktiga ändringar i projektet dokumenteras i denna fil.

## [2.3.0] - 2025-11-23

### Tillagt
- **5 tidigare oimplementerade verktyg nu funktionella:**
  - `scb_test_selection` - Validera selektioner innan API-anrop
  - `scb_preview_data` - Förhandsgranska data (max 20 rader)
  - `scb_browse_folders` - Navigera SCB:s databasstruktur
  - `scb_search_regions` - Sök regioner på namn (fuzzy search)
  - `scb_find_region_code` - Hitta exakta regionkoder för kommun/län

### Fixat
- **Verklig kvothantering:** `scb_check_usage` och `scb_get_api_status` visar nu faktisk API-användning istället för statiska värden
- **Korrekt metadata:** `query.table_id` i `get_table_data` visar nu rätt tabell-id istället för dimension-namn
- **Strukturerad felhantering:** Fel returneras som JSON-objekt med separata fält för HTTP-status, SCB-fel och meddelanden
- **Bättre felgranularitet:** 424-fel och andra fel inkluderar nu timestamp och strukturerad information

### Förbättrat
- Utökad region-sökning med typ-identifiering (county/municipality/country)
- Preview-data med automatisk selection om ingen anges
- Test-selection med hjälpsamma felmeddelanden och förslag

## [2.2.0] - 2025-11-23

### Borttaget
- Alla E-hälsomyndigheten-verktyg (ehealth_search_tables, ehealth_get_table_info, ehealth_get_medicine_data)
- Fokuserar nu enbart på SCB-statistik

### Ändrat
- Servernamn från "SCB & E-hälsomyndigheten Statistics Server" till "SCB Statistics Server"
- Antal verktyg från 14 till 11
- Uppdaterade beskrivningar för att reflektera SCB-fokus

## [2.1.0] - 2025-11-22

### Tillagt
- Fullständigt MCP-protokollstöd med initialize och initialized metoder
- HTTP transport med CORS-stöd
- Express-baserad HTTP-server

### Fixat
- OAuth/autentiseringsfel med Claude Code
- MCP-handshake-protokoll nu korrekt implementerat

## [1.0.0] - 2025-11-20

### Tillagt
- Initial release
- 11 SCB-verktyg för statistikåtkomst
- Automatisk variabelöversättning
- Förhandsvalidering av queries
- Rate limiting enligt SCBs API-specifikation
