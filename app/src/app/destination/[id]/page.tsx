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
    return { title: 'Destination Not Found | Travel Agent Zero' };
  }

  const description = `Plan your trip to ${destination.name} (${destination.countries.join(', ')}). ${destination.duration}-day ${destination.climate.toLowerCase()} ${destination.type.toLowerCase()} adventure.`;

  return {
    title: `${destination.name} | Travel Agent Zero`,
    description,
    openGraph: {
      title: `${destination.name} | Travel Agent Zero`,
      description,
    },
  };
}

export default function DestinationPage() {
  return <DestinationClient />;
}
