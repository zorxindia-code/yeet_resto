"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { whenEssentialsReady } from "@/lib/ready";

/**
 * Refresh / later-visit loader (html[data-intro="refresh"]): the minimal red sheet with the small
 * centred logo, the same look as the in-app page wipe. It lifts away as soon as the page is actually
 * ready (hydrated, fonts, the hero's main image), never on a fixed timer.
 */
export function RefreshLoader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const html = document.documentElement;
    if (!el || html.dataset.intro !== "refresh") return;
    html.dataset.introJs = "1"; // cancels the CSS failsafe
    let tween: gsap.core.Tween | null = null;
    let cancelled = false;
    const hide = () => {
      el.style.display = "none";
      html.dataset.intro = "done";
    };
    whenEssentialsReady(3000).then(() => {
      if (cancelled) return;
      window.dispatchEvent(new Event("yeet:intro-done"));
      if (prefersReducedMotion()) return hide();
      tween = gsap.to(el, { yPercent: -100, duration: 0.6, ease: "power3.inOut", onComplete: hide });
    });
    return () => {
      cancelled = true;
      tween?.kill();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="refresh-loader fixed inset-0 z-[100] items-center justify-center bg-brand">
      <Image src="/brand/yeet-logo.png" alt="" width={1080} height={579} sizes="224px" loading="eager" className="logo-die-cut h-auto w-40 md:w-56" />
    </div>
  );
}
