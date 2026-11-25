"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";

type LenisRef = RefObject<Lenis | null>;

/** Height of the fixed header; anchor scrolls stop this far above their target. */
export const HEADER_OFFSET = -72;
const LenisContext = createContext<LenisRef | null>(null);

/**
 * Stable ref to the single shared Lenis instance. The instance is created in an
 * effect, so read `.current` inside handlers or effects, never during render.
 */
export const useLenis = () => useContext(LenisContext);

/**
 * The only smooth-scroll engine on the site. Lenis is driven by GSAP's ticker
 * so ScrollTrigger, Lenis and every pinned section share one animation frame.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    registerGsap();
    const reduce = prefersReducedMotion();

    const instance = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduce,
      // Lenis smooth-scrolls same-page hash links itself; the offset clears the fixed header.
      anchors: { offset: HEADER_OFFSET },
    });

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Refresh trigger positions once fonts and images have settled.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    lenisRef.current = instance;

    return () => {
      gsap.ticker.remove(tick);
      instance.off("scroll", ScrollTrigger.update);
      instance.destroy();
      window.removeEventListener("load", refresh);
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
