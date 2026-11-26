"use client";

import { SmartLink } from "@/components/SmartLink";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { StickerButton } from "@/components/StickerButton";
import { FullscreenNavigation } from "@/components/FullscreenNavigation";
import { useActiveNav } from "@/lib/useActiveNav";
import { MediaImage } from "@/components/MediaImage";

/**
 * Desktop (lg+): a bar that adapts to the surface beneath it (sections declare
 * data-surface="red|white") and turns into a compact sticky bar after the first scroll.
 * Phones and tablets: a floating capsule (menu · logo · order), clear of the iOS notch.
 * Both open the same full-screen sticker menu.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [compact, setCompact] = useState(false);
  const [surfaceRed, setSurfaceRed] = useState(true);
  const [open, setOpen] = useState(false);
  const active = useActiveNav();
  // Only the home hero and red sections tint the header; other pages stay solid.
  const onRed = isHome && surfaceRed;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setCompact(window.scrollY > 60);
      let tone: string | null = null;
      document.querySelectorAll<HTMLElement>("[data-surface]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= 44 && r.bottom > 44) tone = el.dataset.surface ?? null;
      });
      if (tone) setSurfaceRed(tone === "red");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const solid = compact || !isHome;
  const textTone = solid ? "text-ink" : onRed ? "text-white" : "text-ink";
  const barTone = solid ? "bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]" : "bg-transparent";

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[70]">
        {/* Phones and tablets: floating capsule */}
        <div className="pointer-events-auto px-3 pt-[max(10px,env(safe-area-inset-top))] lg:hidden">
          <div className="relative mx-auto flex h-14 max-w-xl items-center justify-between rounded-full bg-white pl-1.5 pr-1.5 text-ink shadow-[0_8px_24px_-14px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="fullscreen-nav"
              className="flex h-11 items-center gap-2 rounded-full pl-3 pr-3.5 font-display text-sm uppercase tracking-wide"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h10" />
              </svg>
              Menu
            </button>
            <SmartLink href="/" aria-label={`${SITE.name} — home`} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {/* Declared at the exact 128px resize (128×69) so intrinsic and declared ratios match. */}
              <MediaImage skip="(min-width: 1024px)" src="/brand/yeet-logo.png" alt={SITE.name} width={128} height={69} loading="eager" sizes="128px" className="h-9 w-auto" />
            </SmartLink>
            <SmartLink
              href={SITE.orderUrl}
              className="flex h-11 items-center rounded-full bg-brand px-5 font-display text-sm uppercase tracking-wide text-white transition-colors active:bg-brand-deep"
            >
              Order
            </SmartLink>
          </div>
        </div>

        {/* Desktop bar */}
        <div className={`pointer-events-auto hidden transition-[background-color,box-shadow,padding] duration-300 lg:block ${barTone} ${textTone}`}>
        <div className={`mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 transition-[height,padding] duration-300 md:px-10 ${solid ? "h-[72px]" : "py-5"}`}>
          <SmartLink href="/" aria-label={`${SITE.name} — home`} className="shrink-0" data-cursor="view">
            {/* Desktop-bar logo: phones (capsule header) never download it. */}
            <MediaImage
              skip="(max-width: 1023px)"
              src="/brand/yeet-logo.png"
              alt={SITE.name}
              width={1080}
              height={579}
              loading="eager"
              sizes="128px"
              className={`w-auto transition-[height] duration-300 ${solid ? "h-11" : "h-14 md:h-16"}`}
            />
          </SmartLink>

          <nav aria-label="Primary" className="hidden items-center gap-7 font-display text-base uppercase tracking-wide lg:flex">
            {NAV_LINKS.map((item) => {
              const current = active.label === item.label;
              return (
              <SmartLink
                key={item.label}
                href={item.href}
                aria-current={current ? (active.kind === "page" ? "page" : "location") : undefined}
                className={`relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:origin-left after:rounded-full after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100 ${
                  current ? "after:scale-x-100" : "after:scale-x-0"
                }`}
              >
                {item.label}
              </SmartLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div>
              <StickerButton href={SITE.orderUrl} surface={solid || !onRed ? "white" : "red"} className="py-3 text-base">
                Order now
              </StickerButton>
            </div>
          </div>
        </div>
        </div>
      </header>

      <FullscreenNavigation open={open} onClose={close} active={active} />
    </>
  );
}
