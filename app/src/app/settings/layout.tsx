import type { Metadata } from "next";

// See travelers/layout.tsx — a client page can't set its own canonical, so this
// segment layout stops settings from inheriting the homepage canonical.
export const metadata: Metadata = {
  alternates: { canonical: "https://krool.github.io/TravelAgentZero/settings/" },
};

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
