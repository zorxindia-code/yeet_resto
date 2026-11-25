import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

let registered = false;

/** Registers GSAP plugins once. Safe to call from any client component. */
export function registerGsap() {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(ScrollTrigger, Draggable);
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

export { gsap, ScrollTrigger, Draggable };
