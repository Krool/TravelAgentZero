import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppProvider } from "@/components/layout/AppProvider";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";

// GA only loads in production so local dev / preview builds never pollute the
// live analytics property.
const isProd = process.env.NODE_ENV === "production";
const GA_ID = "G-SXG8M67HPV";

const SITE_DESCRIPTION =
  "Compare 100+ destinations by best month to visit, flight time from 25 home airports, budget, safety, and kid-friendliness. Score-ranked trip planning with cost breakdowns, neighborhood guides, and month-by-month flight price estimates.";

export const metadata: Metadata = {
  title: {
    default: "Travel Agent Zero: Score-Ranked Trip Planner",
    template: "%s | Travel Agent Zero",
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL("https://krool.github.io/TravelAgentZero"),
  alternates: { canonical: "https://krool.github.io/TravelAgentZero/" },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: "https://krool.github.io/TravelAgentZero/",
    siteName: "Travel Agent Zero",
    title: "Travel Agent Zero: Score-Ranked Trip Planner",
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-preview.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Agent Zero: Score-Ranked Trip Planner",
    description: SITE_DESCRIPTION,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"Travel Agent Zero","url":"https://krool.github.io/TravelAgentZero/","description":SITE_DESCRIPTION,"applicationCategory":"TravelApplication","operatingSystem":"Web","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}) }}
        />
        {isProd && (
          <>
            <Script id="ga-consent-default" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('consent', 'default', { analytics_storage: 'denied', wait_for_update: 500 });
              `}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { content_group: 'Travel Agent Zero' });
              `}
            </Script>
          </>
        )}
        <AppProvider>
          <div className="min-h-screen bg-bg-deep retro-grid scanlines flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <PageViewTracker />
          <ConsentBanner />
        </AppProvider>
      </body>
    </html>
  );
}
