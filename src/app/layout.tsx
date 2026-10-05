import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono, Poppins } from "next/font/google";
import { RevealObserver } from "@/components/effects/RevealObserver";
import { ScrollTop } from "@/components/effects/ScrollTop";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { getAlbumsNav } from "@/lib/navigation";
import { businessJsonLd, homeTitle, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

/** Texte, navigation, boutons (police secondaire de la charte). */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  // 600 n'est utilisé nulle part : une police de moins à télécharger.
  weight: ["300", "400", "500"],
  display: "swap",
});

/** Grands titres : Archivo étendu (axe de largeur), proche de la police principale de la charte. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

/** Tampons de section et métadonnées « billet ». */
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
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
  themeColor: "#1d1e1c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={siteConfig.language}
      id="top"
      className={`${poppins.variable} ${archivo.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Active les animations d'apparition uniquement si JavaScript tourne. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-[400] rounded-full bg-flamingo px-5 py-3 t-label text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Aller au contenu
        </a>

        <Header albumsNav={getAlbumsNav()} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />

        <ScrollTop />
        <RevealObserver />
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={businessJsonLd()} />
      </body>
    </html>
  );
}
