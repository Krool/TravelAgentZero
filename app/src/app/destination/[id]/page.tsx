import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';
import DestinationClient from './DestinationClient';
import { Destination } from '@/types';

async function getDestinations(): Promise<Destination[]> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'destinations.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function generateStaticParams() {
  const destinations = await getDestinations();
  return destinations.map((dest) => ({
    id: dest.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const destinations = await getDestinations();
  const destination = destinations.find((d) => d.id === id);

  if (!destination) {
    return { title: 'Destination Not Found' };
  }

  const description = buildDescription(destination);
  const heroImage = destination.imageUrl?.replace('w=800&h=600', 'w=1600&h=900');

  return {
    // The root layout's title template appends "| Travel Agent Zero".
    title: `${destination.name} Trip: Best Time, Costs & Itinerary`,
    description,
    // Self-referential canonical — without this each destination inherits the
    // root layout's canonical (the homepage) and Google treats it as a duplicate.
    alternates: { canonical: `https://krool.github.io/TravelAgentZero/destination/${id}/` },
    openGraph: {
      title: `${destination.name} Trip: Best Time, Costs & Itinerary`,
      description,
      ...(heroImage && { images: [{ url: heroImage, width: 1600, height: 900 }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${destination.name} Trip: Best Time, Costs & Itinerary`,
      description,
    },
  };
}

// Meta description from real content: itinerary summary + best time, ~155 chars.
function buildDescription(destination: Destination): string {
  const countries = destination.countries.join(', ');
  const place = countries === destination.name ? destination.name : `${destination.name} (${countries})`;
  const base = `${place}: ${destination.itinerarySummary}.`;
  const withTime = `${base} Best time: ${destination.bestTimeDescription}.`;
  if (withTime.length <= 160) return withTime;
  if (base.length <= 160) return base;
  return base.slice(0, 157).replace(/\s+\S*$/, '') + '...';
}

export default async function DestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destinations = await getDestinations();
  const destination = destinations.find((d) => d.id === id);

  // Structured data server-rendered into the static HTML - the page body
  // itself is client-rendered, so this is what crawlers reliably see.
  const jsonLd = destination && [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: destination.name,
      description: buildDescription(destination),
      ...(destination.imageUrl && { image: destination.imageUrl.replace('w=800&h=600', 'w=1600&h=900') }),
      containedInPlace: destination.countries.map((c) => ({ '@type': 'Country', name: c })),
      url: `https://krool.github.io/TravelAgentZero/destination/${destination.id}/`,
      ...(destination.tags && { keywords: destination.tags.join(', ') }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Destinations', item: 'https://krool.github.io/TravelAgentZero/' },
        { '@type': 'ListItem', position: 2, name: destination.name, item: `https://krool.github.io/TravelAgentZero/destination/${destination.id}/` },
      ],
    },
  ];

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <DestinationClient />
    </>
  );
}
