import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MotionPreferences } from "@/components/motion/MotionPreferences";
import { RouteTheme } from "@/components/layout/RouteTheme";
import { getAllDestinations, getDestinationSlugs } from "@/lib/destinations";
import { countWord } from "@/lib/format";
import { BRAND_THEME } from "@/lib/theme";
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
    `An editorial guide to ${countWord(getAllDestinations().length)} natural destinations in Kazakhstan, from the chalk plateaus of the west to the lakes of the Tian Shan and the Altai, with sourced facts and licensed photography.`,
  applicationName: "NATURE KZ",
};

export const viewport: Viewport = {
  themeColor: BRAND_THEME.bg,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const themes = Object.fromEntries(getAllDestinations().map((d) => [d.slug, d.theme]));
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a
          href="#main"
          className="fixed top-3 left-3 z-[70] -translate-y-24 rounded bg-fg px-4 py-3 text-page transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <MotionPreferences>
          <RouteTheme themes={themes}>
            <SiteHeader guideSlugs={getDestinationSlugs()} destinationIds={getAllDestinations().map((d) => d.id)} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </RouteTheme>
        </MotionPreferences>
      </body>
    </html>
  );
}
