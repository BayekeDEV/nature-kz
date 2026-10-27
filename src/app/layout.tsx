import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MotionPreferences } from "@/components/motion/MotionPreferences";
import { getDestinationSlugs } from "@/lib/destinations";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NATURE KZ — Discover Kazakhstan, beyond the familiar",
    template: "%s · NATURE KZ",
  },
  description:
    "An editorial guide to seven natural destinations in Kazakhstan, from the chalk towers of Bozzhyra to the lakes of the Tian Shan, with sourced facts and licensed photography.",
  applicationName: "NATURE KZ",
};

export const viewport: Viewport = {
  themeColor: "#f5f1ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-svh flex-col">
        <a
          href="#main"
          className="fixed top-3 left-3 z-[70] -translate-y-24 rounded bg-ink px-4 py-3 text-paper transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <MotionPreferences>
          <SiteHeader guideSlugs={getDestinationSlugs()} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </MotionPreferences>
      </body>
    </html>
  );
}
