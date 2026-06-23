import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppProvider } from "@/components/layout/AppProvider";

export const metadata: Metadata = {
  title: "Travel Agent Zero",
  description: "A retro-futuristic travel planning companion. Browse destinations, plan trips, and organize itineraries with vintage-inspired aesthetics.",
  metadataBase: new URL("https://krool.github.io/TravelAgentZero"),
  alternates: { canonical: "https://krool.github.io/TravelAgentZero/" },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: "https://krool.github.io/TravelAgentZero/",
    title: "Travel Agent Zero",
    description: "A retro-futuristic travel planning companion. Browse destinations, plan trips, and organize itineraries with vintage-inspired aesthetics.",
    images: [{ url: "/og-preview.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Agent Zero",
    description: "A retro-futuristic travel planning companion. Browse destinations, plan trips, and organize itineraries with vintage-inspired aesthetics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"Travel Agent Zero","url":"https://krool.github.io/TravelAgentZero/","description":"A retro-futuristic travel planning companion. Browse destinations, plan trips, and organize itineraries.","applicationCategory":"TravelApplication","operatingSystem":"Web","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SXG8M67HPV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SXG8M67HPV', { content_group: 'Travel Agent Zero' });
          `}
        </Script>
        <AppProvider>
          <div className="min-h-screen bg-bg-deep retro-grid scanlines flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
