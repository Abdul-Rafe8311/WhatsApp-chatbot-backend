import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StickyCTA } from "@/components/StickyCTA";
import { salon } from "@/config/salon";
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

export const metadata: Metadata = {
  title: `${salon.info.name} — ${salon.info.tagline}`,
  description: `Bridal makeup and balayage in ${salon.info.city}.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
