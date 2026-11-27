import type { Metadata, Viewport } from "next";
import { Fredoka, DM_Sans } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE } from "@/lib/site";
import { INTRO_LOGO, introLogoSrcSet } from "@/lib/intro";
import { INTRO_SEEN_KEY } from "@/lib/ready";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Cravings? YEET it.`, template: `%s · ${SITE.name}` },
  description: "Big bites. Bold flavours. Good moods. Smash burgers, zinger burgers, wings, wraps, strips meals, loaded fries and shakes from YEET RESTO CAFÉ.",
  openGraph: {
    title: `${SITE.name} — Cravings? YEET it.`,
    description: "Big bites. Bold flavours. Good moods.",
    images: [{ url: "/brand/yeet-logo.png", alt: "YEET RESTO CAFÉ logo" }],
    type: "website",
  },
  // Favicons come from app/icon.png and app/apple-icon.png (small, purpose-sized files).
};

export const viewport: Viewport = {
  themeColor: "#dd0303",
  width: "device-width",
  initialScale: 1,
  // Lets the floating mobile header and footer pad around the iOS notch and home indicator.
  viewportFit: "cover",
};

// Decides before first paint whether the homepage loader runs, and which kind:
//  - Not the homepage (e.g. /menu opened directly): "done", no loader at all.
//  - "play": first homepage visit of the session → the full logo fill, then the peel. The seen flag
//    is set only when the loader finishes, so a reload before that shows it again.
//  - "refresh": later homepage loads, and reduced-motion visitors → the same loader, shorter. With
//    reduced motion the logo shows complete without movement until the page is ready.
// For "play" it also starts the logo download at high priority.
const introScript = `
(function(){try{
  var d = document.documentElement;
  if (location.pathname !== '/') { d.setAttribute('data-intro','done'); return; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)});
  if (!reduce && !seen) {
    d.setAttribute('data-intro','play');
    var l = document.createElement('link');
    l.rel = 'preload'; l.as = 'image';
    l.setAttribute('imagesrcset', ${JSON.stringify(introLogoSrcSet())});
    l.setAttribute('imagesizes', ${JSON.stringify(INTRO_LOGO.sizes)});
    l.setAttribute('fetchpriority', 'high');
    document.head.appendChild(l);
  } else {
    d.setAttribute('data-intro','refresh');
  }
}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: introScript sets data-intro on <html> before hydration on purpose.
    // It only covers this element's own attributes, not its children.
    <html lang="en" className={`${fredoka.variable} ${dmSans.variable}`} suppressHydrationWarning>
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
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
