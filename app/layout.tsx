import type { Metadata, Viewport } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileActionBar } from "@/components/MobileActionBar";
import { SITE } from "@/lib/site";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["400", "500", "600", "700"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Cravings? YEET it.`, template: `%s · ${SITE.name}` },
  description: "Big bites. Bold flavours. Good moods. Burgers, chicken, fries, pizza, popcorn and drinks from YEET RESTO CAFÉ.",
  openGraph: {
    title: `${SITE.name} — Cravings? YEET it.`,
    description: "Big bites. Bold flavours. Good moods.",
    images: [{ url: "/brand/yeet-logo.png", alt: "YEET RESTO CAFÉ logo" }],
    type: "website",
  },
  icons: { icon: "/brand/yeet-logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#dd0303",
  width: "device-width",
  initialScale: 1,
};

// Decides before first paint whether the sticker intro should play (once per session).
const introScript = `
(function(){try{
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = sessionStorage.getItem('yeet-intro-seen');
  if (!reduce && !seen && location.pathname === '/') {
    document.documentElement.setAttribute('data-intro','play');
    sessionStorage.setItem('yeet-intro-seen','1');
  }
}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${dmSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-brand"
        >
          Skip to content
        </a>
        <SmoothScrollProvider>
          <CustomCursor />
          <SiteHeader />
          <div id="main">{children}</div>
          <SiteFooter />
          <MobileActionBar />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
