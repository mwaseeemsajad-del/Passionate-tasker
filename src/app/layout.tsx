import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { MotionProvider } from "@/components/motion/motion-provider";
import { site } from "@/data/site";
import { DISPLAY_SCRIPT } from "@/lib/display-prefs";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { type: "website", locale: "en_GB", siteName: site.name },
};

export const viewport: Viewport = {
  themeColor: "#0f110f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The display script changes data-text and data-contrast before React hydrates.
    <html lang="en-GB" className={figtree.variable} data-text="normal" data-contrast="normal" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: DISPLAY_SCRIPT }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-ink"
        >
          Skip to main content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
