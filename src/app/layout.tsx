import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight } from "next/font/google";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { RevealObserver } from "@/components/effects/RevealObserver";
import { Monogram } from "@/components/brand/Monogram";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { getPortfolioNav } from "@/lib/navigation";
import { buildSearchIndex } from "@/lib/search-index";
import { businessJsonLd, homeTitle, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

const { googleSiteVerification, bingSiteVerification } = siteConfig.seo;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${homeTitle} | ${siteConfig.name}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "photography",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: "/",
    title: `${homeTitle} | ${siteConfig.name}`,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
  verification: {
    ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
    ...(bingSiteVerification ? { other: { "msvalidate.01": bingSiteVerification } } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#012624",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={siteConfig.language} id="top" className={`${interTight.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        {/* Active les animations d'apparition uniquement si JavaScript tourne. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[400] rounded-[var(--radius-sm)] bg-phosphor px-4 py-3 t-label text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Aller au contenu
        </a>

        {/* Rideau d'ouverture : ~1s, purement CSS, n'attend aucun chargement. */}
        <div className="intro-curtain" aria-hidden>
          <div className="flex flex-col items-center gap-5 text-platinum">
            <Monogram className="size-14" strokeWidth={2} />
            <span className="t-caption text-silver">{siteConfig.logo.secondary}</span>
          </div>
        </div>

        <Header portfolioNav={getPortfolioNav()} searchIndex={buildSearchIndex()} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />

        <RevealObserver />
        <CustomCursor />
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={businessJsonLd()} />
      </body>
    </html>
  );
}
