import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Registers ScrollTrigger once. Safe to call from any client component.
 * (Draggable is registered by the footer playground only, so it stays out of the main bundle.)
 */
export function registerGsap() {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(ScrollTrigger);
  // Mobile browsers resize the viewport when the address bar shows/hides; refreshing on that
  // would recalculate pins mid-scroll and cause jumps.
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isDesktopFine(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px) and (hover: hover)").matches;
}

/** Shared sticker-motion presets so every section uses the same timing language. */
export const STICKER = {
  slap: { duration: 0.6, ease: "power3.out" },
  hover: { duration: 0.22, ease: "power2.out" },
  peel: { duration: 0.8, ease: "power2.inOut" },
  stagger: 0.09,
} as const;

export { gsap, ScrollTrigger };
