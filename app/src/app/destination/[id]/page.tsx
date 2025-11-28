import { promises as fs } from 'fs';
import path from 'path';
import DestinationClient from './DestinationClient';
import { Destination } from '@/types';

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'destinations.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const destinations: Destination[] = JSON.parse(fileContents);

  return destinations.map((dest) => ({
    id: dest.id,
  }));
}

export default function DestinationPage() {
  return <DestinationClient />;
}
