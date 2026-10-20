import { promises as fs } from 'fs';
import path from 'path';
import { CountryEntry, EntryRule, PassportCode, PASSPORTS } from '@/types';

// Build-time reader for data/visas.json. Server components only: it uses fs.

interface VisaTable {
  verifiedAt: string;
  countries: Record<string, Record<PassportCode, EntryRule> & { source?: string }>;
}

let table: Promise<VisaTable> | null = null;
function loadTable(): Promise<VisaTable> {
  table ??= fs
    .readFile(path.join(process.cwd(), 'data', 'visas.json'), 'utf8')
    .then((s) => JSON.parse(s) as VisaTable);
  return table;
}

export interface DestinationEntries {
  verifiedAt: string;
  byPassport: Record<PassportCode, CountryEntry[]>;
}

export async function getDestinationEntries(countries: string[]): Promise<DestinationEntries> {
  const { verifiedAt, countries: rules } = await loadTable();
  const byPassport = {} as Record<PassportCode, CountryEntry[]>;
  for (const passport of Object.keys(PASSPORTS) as PassportCode[]) {
    byPassport[passport] = countries.map((country) => {
      const entry = rules[country];
      if (!entry) throw new Error(`data/visas.json has no entry for "${country}"`);
      return { country, rule: entry[passport], source: entry.source };
    });
  }
  return { verifiedAt, byPassport };
}
