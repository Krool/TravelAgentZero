import type { Metadata } from "next";

// See travelers/layout.tsx — a client page can't set its own canonical, so this
// segment layout stops settings from inheriting the homepage canonical.
export const metadata: Metadata = {
  title: "Settings",
  description: "Configure your home airport, sound, and data preferences.",
  alternates: { canonical: "https://krool.github.io/TravelAgentZero/settings/" },
  // Purely local configuration - no search value.
  robots: { index: false, follow: true },
};

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
