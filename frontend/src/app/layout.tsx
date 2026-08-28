import type { Metadata, Viewport } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StickyCTA } from "@/components/StickyCTA";
import { salon } from "@/config/salon";
import { localBusinessJsonLd } from "@/lib/seo";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

const title = `${salon.info.name} — ${salon.info.tagline}`;
const description = `Bridal makeup for mehndi, nikah, barat and walima in ${salon.info.city}. Certified artist trained at Kashee's Official. Book on WhatsApp.`;

/**
 * Share metadata matters more here than on most sites: almost every visitor
 * arrives from the Instagram bio link, and the link gets forwarded on
 * WhatsApp. Without a card that forward is a bare URL.
 *
 * og:image needs an ABSOLUTE url, so the whole openGraph block is gated on
 * info.siteUrl. While that is null the tags are omitted rather than emitted
 * with a relative path no chat client can resolve — a broken card is worse
 * than none, and a made-up domain would be worse still.
 */
const site = salon.info.siteUrl;

export const metadata: Metadata = {
  title,
  description,
  ...(site ? { metadataBase: new URL(site) } : {}),
  applicationName: salon.info.name,
  authors: salon.info.owner ? [{ name: salon.info.owner }] : undefined,
  keywords: [
    "bridal makeup",
    salon.info.city,
    "barat makeup",
    "walima makeup",
    "mehndi makeup",
    "balayage",
  ],
  alternates: site ? { canonical: "/" } : undefined,
  openGraph: site
    ? {
        type: "website",
        siteName: salon.info.name,
        title,
        description,
        locale: "en_PK",
        url: "/",
        images: [
          {
            url: "/images/og.jpg",
            width: 1200,
            height: 630,
            alt: `Bridal makeup by ${salon.info.name}`,
          },
        ],
      }
    : undefined,
  twitter: site
    ? { card: "summary_large_image", title, description, images: ["/images/og.jpg"] }
    : undefined,
};

/** Matches the two theme grounds, so mobile browser chrome follows the page. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6f7" },
    { media: "(prefers-color-scheme: dark)", color: "#170e11" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      id="top"
      className={`${fraunces.variable} ${karla.variable} h-full antialiased`}
      // The pre-paint script adds .dark before React sees the document, so
      // the server HTML and the live DOM differ by design.
      suppressHydrationWarning
    >
      <head>
        {/* Raw inline script on purpose. next/script's beforeInteractive
            strategy does NOT execute inline code before paint — it pushes it
            into a self.__next_s queue that the Next runtime drains after
            load, which reintroduces the flash this exists to prevent.
            A synchronous inline script is the only thing that runs before
            first paint on a static export. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        {/* Built from the config, so it cannot disagree with the page.
            Telephone and opening hours are deliberately absent while they
            are unconfirmed — this is what Google reads to build a business
            panel, and a guess here is published as fact about a real
            business. */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: localBusinessJsonLd() }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <StickyCTA />
      </body>
    </html>
  );
}
