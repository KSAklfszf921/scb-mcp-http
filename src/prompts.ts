import { Prompt } from '@modelcontextprotocol/sdk/types.js';

export const prompts: Prompt[] = [
  {
    name: 'analyze-regional-statistics',
    description: 'Analysera regional statistik för en specifik kommun eller län',
    arguments: [
      {
        name: 'region_name',
        description: 'Namn på kommun eller län (t.ex. "Stockholm", "Göteborg", "Kungälv")',
        required: true,
      },
      {
        name: 'topic',
        description: 'Statistikområde att analysera (t.ex. "befolkning", "arbetslöshet", "sysselsättning", "utbildning")',
        required: true,
      },
      {
        name: 'time_period',
        description: 'Tidsperiod att analysera (t.ex. "2024", "senaste året", "2020-2024")',
        required: false,
      },
    ],
  },
  {
    name: 'compare-municipalities',
    description: 'Jämför statistik mellan två eller flera kommuner',
    arguments: [
      {
        name: 'municipalities',
        description: 'Kommaseparerad lista av kommuner att jämföra (t.ex. "Stockholm,Göteborg,Malmö")',
        required: true,
      },
      {
        name: 'metric',
        description: 'Vilken statistik att jämföra (t.ex. "befolkning", "arbetslöshet", "inkomst")',
        required: true,
      },
      {
        name: 'year',
        description: 'År att jämföra (t.ex. "2024")',
        required: false,
      },
    ],
  },
  {
    name: 'find-statistics-table',
    description: 'Hjälp användaren hitta rätt SCB-tabell för sitt ändamål',
    arguments: [
      {
        name: 'topic',
        description: 'Beskriv vilken typ av statistik du letar efter (t.ex. "befolkningsutveckling", "företagsetableringar", "bostadspriser")',
        required: true,
      },
      {
        name: 'region_type',
        description: 'Regional nivå: "kommun", "län", "riket", eller "alla"',
        required: false,
      },
      {
        name: 'time_period',
        description: 'Önskad tidsperiod (t.ex. "månadsvis", "årsvis", "kvartalsvis")',
        required: false,
      },
    ],
  },
  {
    name: 'build-custom-query',
    description: 'Steg-för-steg guide för att bygga en komplex SCB-query med rätt variabler och värden',
    arguments: [
      {
        name: 'table_id',
        description: 'ID för SCB-tabellen att hämta data från (t.ex. "TAB5663")',
        required: true,
      },
      {
        name: 'description',
        description: 'Beskriv vad du vill ha ut ur tabellen',
        required: false,
      },
    ],
  },
  {
    name: 'employment-trend-analysis',
    description: 'Analysera sysselsättnings- och arbetslöshetstrend för en region över tid',
    arguments: [
      {
        name: 'region',
        description: 'Region att analysera (kommun, län eller riket)',
        required: true,
      },
      {
        name: 'months',
        description: 'Antal månader tillbaka att analysera (t.ex. "6", "12", "24")',
        required: false,
      },
    ],
  },
  {
    name: 'population-demographics',
    description: 'Hämta demografisk information för en region (ålder, kön, födelseöverskott, etc.)',
    arguments: [
      {
        name: 'region',
        description: 'Region att analysera',
        required: true,
      },
      {
        name: 'breakdown',
        description: 'Typ av uppdelning: "age", "sex", "both"',
        required: false,
      },
    ],
  },
];

export function getPromptById(name: string): Prompt | undefined {
  return prompts.find(p => p.name === name);
}

export function generatePromptMessages(promptName: string, args: Record<string, string>): Array<{ role: string; content: { type: string; text: string } }> {
  const messages: Array<{ role: string; content: { type: string; text: string } }> = [];

  switch (promptName) {
    case 'analyze-regional-statistics':
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Analysera ${args.topic}-statistik för ${args.region_name}${args.time_period ? ` under perioden ${args.time_period}` : ''}.

Använd följande steg:
1. Använd scb_find_region_code för att hitta regionkoden för "${args.region_name}"
2. Använd scb_search_tables för att hitta relevanta tabeller om "${args.topic}"
3. Undersök de mest relevanta tabellerna med scb_get_table_info
4. Hämta data med scb_get_table_data
5. Presentera resultatet med insikter och trender

Fokusera på nyckeltal och tydliga jämförelser.`,
        },
      });
      break;

    case 'compare-municipalities':
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Jämför ${args.metric} mellan följande kommuner: ${args.municipalities}${args.year ? ` för år ${args.year}` : ''}.

Steg att följa:
1. Använd scb_find_region_code för varje kommun för att hitta regionkoder
2. Sök efter relevanta tabeller om "${args.metric}" med scb_search_tables
3. Hämta data för alla kommuner
4. Presentera en jämförelsetabell eller sammanfattning
5. Inkludera eventuella anmärkningsvärda skillnader eller likheter`,
        },
      });
      break;

    case 'find-statistics-table':
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Hjälp mig hitta rätt SCB-tabell för: "${args.topic}"

${args.region_type ? `Regional nivå: ${args.region_type}\n` : ''}${args.time_period ? `Tidsperiod: ${args.time_period}\n` : ''}
Steg:
1. Sök i SCBs databas med scb_search_tables med relevanta söktermer
2. Undersök de mest relevanta tabellerna med scb_get_table_info
3. Kontrollera vilka dimensioner och variabler som finns med scb_get_table_variables
4. Rekommendera den bästa tabellen och förklara varför
5. Ge ett exempel på hur man hämtar data från tabellen`,
        },
      });
      break;

    case 'build-custom-query':
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Hjälp mig bygga en query för tabell ${args.table_id}.

${args.description ? `Jag vill: ${args.description}\n\n` : ''}Steg att gå igenom:
1. Använd scb_get_table_info för att se tabellens struktur
2. Använd scb_get_table_variables för att se alla tillgängliga variabler och deras värden
3. Hjälp mig bygga en korrekt selection baserat på mina behov
4. Använd scb_test_selection för att validera selectionen
5. Kör scb_get_table_data för att hämta datan
6. Förklara resultatet

Var pedagogisk och förklara varje steg.`,
        },
      });
      break;

    case 'employment-trend-analysis':
      const months = args.months || '12';
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Analysera sysselsättnings- och arbetslöshetstrend för ${args.region} de senaste ${months} månaderna.

Använd följande arbetsgång:
1. Hitta regionkoden med scb_find_region_code
2. Sök efter arbetskraftsstatistik med scb_search_tables (sök på "unemployment", "employment", "arbetslöshet")
3. Använd tabell TAB5663 eller liknande för att hämta månadsdata
4. Hämta data för de senaste ${months} månaderna
5. Beräkna och visa:
   - Aktuell arbetslöshet
   - Trend över tiden (ökande/minskande)
   - Jämförelse med föregående år
   - Högsta och lägsta värden under perioden
6. Presentera resultatet visuellt med tydlig tabell`,
        },
      });
      break;

    case 'population-demographics':
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: `Hämta demografisk information för ${args.region}.

${args.breakdown ? `Uppdelning efter: ${args.breakdown}\n\n` : ''}Steg:
1. Hitta regionkoden med scb_find_region_code
2. Sök efter befolkningsstatistik med scb_search_tables
3. Hämta data om:
   - Total befolkning
   - Könsfördelning (om applicable)
   - Åldersfördelning (om applicable)
   - Befolkningsutveckling de senaste åren
4. Presentera en överskådlig sammanfattning med nyckeltal`,
        },
      });
      break;

    default:
      messages.push({
        role: 'user',
        content: {
          type: 'text',
          text: 'Okänd prompt.',
        },
      });
  }

  return messages;
}
