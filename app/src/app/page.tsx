import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import HomeClient from './HomeClient';
import { Destination } from '@/types';

// The interactive list needs the visitor's saved preferences, so it only
// renders in the browser. This server-rendered directory is what the static
// HTML carries until then: every destination, linked, grouped by region. It is
// shown under the loading bar and replaced once the catalog loads.
async function DestinationDirectory() {
  const filePath = path.join(process.cwd(), 'data', 'destinations.json');
  const destinations: Destination[] = JSON.parse(await fs.readFile(filePath, 'utf8'));

  const byRegion = new Map<string, Destination[]>();
  for (const d of destinations) {
    const list = byRegion.get(d.region) ?? [];
    list.push(d);
    byRegion.set(d.region, list);
  }
  const regions = [...byRegion.entries()]
    .map(([region, list]) => [region, list.sort((a, b) => a.name.localeCompare(b.name, 'en'))] as const)
    .sort(([a], [b]) => a.localeCompare(b, 'en'));

  return (
    <nav aria-label="All destinations" className="container mx-auto px-4 pb-6">
      <h2 className="font-semibold text-sm text-text-primary mb-4">
        All {destinations.length} destinations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {regions.map(([region, list]) => (
          <section key={region}>
            <h3 className="eyebrow text-retro-cyan mb-2">{region}</h3>
            <ul className="space-y-1.5">
              {list.map((d) => {
                const countries = d.countries.join(', ');
                return (
                  <li key={d.id} className="text-sm">
                    {/* prefetch off: 123 links would each fetch a route payload. */}
                    <Link
                      href={`/destination/${d.id}`}
                      prefetch={false}
                      className="text-text-secondary hover:text-retro-cyan transition-colors"
                    >
                      {d.name}
                    </Link>
                    {countries !== d.name && (
                      <span className="text-text-muted text-xs"> · {countries}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}

export default function HomePage() {
  return <HomeClient directory={<DestinationDirectory />} />;
}
