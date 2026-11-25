"use client";

import { SmartLink } from "@/components/SmartLink";
import { NAV_LINKS, SITE } from "@/lib/site";
import { useLenis } from "@/components/SmoothScrollProvider";
import { StickerPlayground } from "@/components/StickerPlayground";

export function SiteFooter() {
  const lenis = useLenis();

  return (
    <footer>
      <StickerPlayground />

      {/* Functional content sits outside the draggable layer */}
      <div data-surface="red" className="surface-red paper-texture relative z-10 pb-28 pt-16 md:pb-14 md:pt-20">
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1440px] gap-12 px-5 md:grid-cols-12 md:px-10">
          <nav aria-label="Footer" className="md:col-span-4">
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-white/80">Explore</h2>
            <ul className="mt-4 flex flex-col gap-2 font-display text-3xl uppercase">
              {NAV_LINKS.map((item) => (
                <li key={item.label}>
                  <SmartLink href={item.href} className="inline-block py-0.5 hover:underline underline-offset-4">
                    {item.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-white/80">Visit & contact</h2>
            <ul className="mt-4 space-y-2 font-body text-base">
              <li>{SITE.address}</li>
              <li>{SITE.hours}</li>
              <li>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">{SITE.phone}</a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">{SITE.email}</a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-6 md:col-span-4 md:items-end">
            <div>
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-white/80">Follow the gang</h2>
              <ul className="mt-4 flex gap-3 font-display text-base uppercase">
                <li>
                  <a href={SITE.instagramUrl} className="sticker-cta inline-block border-2 border-white bg-white px-5 py-2.5 text-brand" data-cursor="view">Instagram</a>
                </li>
                <li>
                  <a href={SITE.tiktokUrl} className="sticker-cta inline-block border-2 border-white px-5 py-2.5" data-cursor="view">TikTok</a>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() =>
                lenis?.current
                  ? lenis.current.scrollTo(0, { duration: 1.4 })
                  : window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="sticker-cta sticker-label inline-flex items-center gap-2 bg-white px-6 py-3 text-lg text-brand"
              data-cursor="explore"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
              Back to top
            </button>
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-[1440px] flex-col gap-2 border-t border-white/25 px-5 pt-6 font-body text-sm text-white/80 md:flex-row md:justify-between md:px-10">
          <p>© {SITE.name}. All rights reserved.</p>
          <p>Placeholder footer details: replace before launch.</p>
        </div>
      </div>
    </footer>
  );
}
