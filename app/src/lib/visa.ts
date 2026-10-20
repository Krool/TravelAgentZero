import { EntryRule, EntryStatus } from '@/types';

// Entry-requirement helpers shared by the browser and the build. The table
// itself (data/visas.json) is read at build time only: the index carries one
// status per passport per destination, and detail pages get their full rules
// as props, so the 40KB table never ships to the browser.

/** Least to most restrictive. Keep in sync with ENTRY_RANK in scripts/build-index.js. */
export const ENTRY_RANK: EntryStatus[] = ['domestic', 'none', 'eta', 'on-arrival', 'evisa', 'visa'];

/** No visa needed. An online authorization (ESTA, UK ETA, eTA) still counts. */
export function isVisaFree(status: EntryStatus): boolean {
  return status === 'domestic' || status === 'none' || status === 'eta';
}

export const ENTRY_LABEL: Record<EntryStatus, string> = {
  domestic: 'Domestic trip',
  none: 'No visa needed',
  eta: 'Online authorization, no visa',
  'on-arrival': 'Visa on arrival',
  evisa: 'e-Visa before travel',
  visa: 'Visa required in advance',
};

export function describeRule(rule: EntryRule): string {
  const label = ENTRY_LABEL[rule.status];
  return rule.days ? `${label}, up to ${rule.days} days` : label;
}
