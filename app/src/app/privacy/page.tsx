import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy | Travel Agent Zero',
  description: 'How Travel Agent Zero handles your data: local-only storage and privacy-friendly, consent-gated analytics.',
  alternates: { canonical: 'https://krool.github.io/TravelAgentZero/privacy/' },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Privacy</h1>
        <p className="text-text-secondary text-sm mb-6">
          Travel Agent Zero is a static site with no accounts and no server-side
          database. Here is exactly what happens to your data.
        </p>

        <Section title="Your data stays in your browser">
          Travelers, ratings, notes, favorites, and preferences are stored only
          in your browser&apos;s local storage. They are never uploaded to us or
          anyone else. Clearing your browser data (or using Settings &rarr; Clear
          All Data) removes them permanently. Export/Import lets you move that
          data between browsers yourself.
        </Section>

        <Section title="Analytics (only if you accept)">
          We use Google Analytics 4 to understand which destinations and features
          are popular. It loads with consent defaulted to denied, so nothing is
          stored until you choose &ldquo;Accept&rdquo; on the consent banner. The
          events we send are deliberately free of personal information: no
          traveler names, no search text, and no note content are ever
          transmitted &mdash; only destination ids, coarse counts, and which
          filters were used.
        </Section>

        <Section title="No tracking in development">
          Analytics only runs on the published site. Local development and
          preview builds send nothing.
        </Section>

        <Section title="Third parties">
          Destination photos are loaded from Unsplash. The site is hosted on
          GitHub Pages, which may log standard request metadata (such as IP
          address) as part of serving the page, per GitHub&apos;s own privacy
          practices.
        </Section>

        <p className="text-xs text-text-muted mt-8">
          Questions? This is a personal project in the Krool World portfolio.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="font-semibold text-sm text-retro-cyan mb-2">{title}</h2>
      <p className="text-text-secondary text-sm leading-relaxed">{children}</p>
    </section>
  );
}
