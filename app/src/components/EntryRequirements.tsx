import { CountryEntry, PassportCode, PASSPORTS } from '@/types';
import { describeRule, isVisaFree } from '@/lib/visa';
import { cn } from '@/lib/utils';

/** Per-country entry rules for one passport, from data/visas.json. */
export function EntryRequirements({
  entries,
  passport,
  verifiedAt,
  print = false,
}: {
  entries: CountryEntry[];
  passport: PassportCode;
  verifiedAt: string;
  print?: boolean;
}) {
  const showCountry = entries.length > 1;

  return (
    <div className="space-y-3">
      <ul className="space-y-2.5">
        {entries.map(({ country, rule, source }) => (
          <li key={country} className="text-sm">
            <div className="flex flex-wrap items-baseline gap-x-2">
              {showCountry && <span className={cn('font-medium', !print && 'text-text-primary')}>{country}:</span>}
              <span className={cn(!print && (isVisaFree(rule.status) ? 'text-retro-green' : 'text-retro-orange'))}>
                {describeRule(rule)}
              </span>
            </div>
            {rule.note && (
              <p className={cn('text-xs mt-0.5', !print && 'text-text-secondary')}>{rule.note}</p>
            )}
            {source && !print && (
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-retro-cyan hover:underline"
              >
                Official source
              </a>
            )}
          </li>
        ))}
      </ul>
      <p className={cn('text-[10px]', !print && 'text-text-muted')}>
        {PASSPORTS[passport]} passport. Checked {verifiedAt}; rules change, so confirm with the
        official source before booking.
      </p>
    </div>
  );
}
