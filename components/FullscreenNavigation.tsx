"use client";

import { SmartLink } from "@/components/SmartLink";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { NAV_LINKS, SITE } from "@/lib/site";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { useLenis } from "@/components/SmoothScrollProvider";
import { StickerButton } from "@/components/StickerButton";

type Props = { open: boolean; onClose: () => void };

// Decorations live in negative space only: below the link list on phones,
// in the empty right half on larger screens. Two are desktop-only.
const DECOR = [
  { icon: "burger", className: "left-[10%] top-[max(54%,430px)] w-20 md:left-auto md:right-[8%] md:top-[14%] md:w-36", rot: -12 },
  { icon: "pizza", className: "right-[10%] top-[max(50%,420px)] w-16 md:right-[30%] md:top-[30%] md:w-28", rot: 10 },
  { icon: "popcorn", className: "hidden md:block md:right-[12%] md:bottom-[16%] md:w-28", rot: 8 },
  { icon: "juice", className: "hidden md:block md:right-[32%] md:bottom-[24%] md:w-28", rot: -8 },
] as const;

/** Full-screen menu: a white sheet wipes in, labels slap on like oversized stickers. */
export function FullscreenNavigation({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  // Initial hidden state (no flash of content).
  useEffect(() => {
    if (panelRef.current) gsap.set(panelRef.current, { autoAlpha: 0, clipPath: "circle(0% at 100% 0%)" });
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const reduce = prefersReducedMotion();
    const links = panel.querySelectorAll<HTMLElement>("[data-nav-link]");
    const decor = panel.querySelectorAll<SVGElement>(".nav-decor");

    if (open) {
      lenis?.current?.stop();
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(panel, { autoAlpha: 1, clipPath: "circle(150% at 100% 0%)", duration: reduce ? 0.01 : 0.7, ease: "power3.inOut" });
      if (!reduce) {
        tl.fromTo(
          links,
          { y: 40, scale: 1.25, rotation: () => gsap.utils.random(-8, 8), opacity: 0 },
          { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
          0.25,
        );
        tl.fromTo(decor, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.07 }, 0.4);
      } else {
        gsap.set([links, decor], { opacity: 1 });
      }
      window.setTimeout(() => panel.querySelector<HTMLElement>("a")?.focus(), 350);
    } else {
      gsap.to(panel, {
        autoAlpha: 0,
        clipPath: "circle(0% at 100% 0%)",
        duration: reduce ? 0.01 : 0.5,
        ease: "power3.inOut",
      });
      lenis?.current?.start();
    }
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      id="fullscreen-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!open}
      inert={!open}
      className="fixed inset-0 z-[90] overflow-hidden bg-white text-ink"
    >
      <div className="paper-texture absolute inset-0" aria-hidden="true" />
      {DECOR.map((d) => (
        <FoodIcon
          key={d.icon}
          name={d.icon}
          className={`nav-decor sticker-edge absolute text-brand ${d.className}`}
          style={{ transform: `rotate(${d.rot}deg)` }}
        />
      ))}

      <div className="relative flex h-full flex-col px-6 pb-10 pt-28 md:px-14">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white md:right-10 md:top-8"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <nav aria-label="Primary">
          <ul className="flex flex-col gap-2 md:gap-3">
            {NAV_LINKS.map((item, i) => (
              <li key={item.label} data-nav-link>
                <SmartLink
                  href={item.href}
                  onClick={onClose}
                  data-cursor="explore"
                  className="sticker-label inline-flex items-baseline gap-4 py-1 text-[clamp(3rem,11vw,8rem)] text-brand transition-transform duration-300 ease-out hover:-rotate-2 hover:translate-x-2 focus-visible:-rotate-2"
                >
                  <span className="font-body text-sm text-ink/70">0{i + 1}</span>
                  {item.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-10">
          <StickerButton href={SITE.orderUrl} surface="white" onClick={onClose}>
            Order now
          </StickerButton>
          <p className="font-body text-sm text-ink/70">{SITE.tagline}</p>
        </div>
      </div>
    </div>
  );
}
