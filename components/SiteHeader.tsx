"use client";

import Image from "next/image";
import { SmartLink } from "@/components/SmartLink";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { StickerButton } from "@/components/StickerButton";
import { FullscreenNavigation } from "@/components/FullscreenNavigation";

/**
 * Header adapts to the surface beneath it (sections declare data-surface="red|white"),
 * becomes a compact sticky bar after the first scroll, and opens a full-screen menu.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [compact, setCompact] = useState(false);
  const [surfaceRed, setSurfaceRed] = useState(true);
  const [open, setOpen] = useState(false);
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
      <header className={`fixed inset-x-0 top-0 z-[70] transition-[background-color,box-shadow,padding] duration-300 ${barTone} ${textTone}`}>
        <div className={`mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 transition-[height,padding] duration-300 md:px-10 ${solid ? "h-[72px]" : "py-5"}`}>
          <SmartLink href="/" aria-label={`${SITE.name} — home`} className="shrink-0" data-cursor="view">
            <Image
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
            {NAV_LINKS.map((item) => (
              <SmartLink
                key={item.label}
                href={item.href}
                className="relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:origin-left after:scale-x-0 after:rounded-full after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
              >
                {item.label}
              </SmartLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <StickerButton href={SITE.orderUrl} surface={solid || !onRed ? "white" : "red"} className="py-3 text-base">
                Order now
              </StickerButton>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="fullscreen-nav"
              className={`flex h-12 w-12 items-center justify-center rounded-2xl lg:hidden ${solid || !onRed ? "bg-brand text-white" : "bg-white text-brand"}`}
            >
              <span className="sr-only">Open menu</span>
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <FullscreenNavigation open={open} onClose={close} />
    </>
  );
}
