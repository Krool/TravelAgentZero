import type { Metadata } from "next";

// The travelers page is a client component and can't export its own metadata,
// so without this it inherits the root layout's canonical (the homepage) and
// Google treats it as a duplicate of "/". A segment layout overrides that.
export const metadata: Metadata = {
  title: "Travelers",
  description: "Manage travelers, mark visited destinations, and set interest ratings so trip scores reflect your group.",
  alternates: { canonical: "https://krool.github.io/TravelAgentZero/travelers/" },
};

export default function TravelersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
