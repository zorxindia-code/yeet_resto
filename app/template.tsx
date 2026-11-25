"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

// The full sticker-peel intro plays once per session (see StickerPreloader).
// Later in-app navigations get this short red-sheet wipe instead.
let isFirstRender = true;

export default function Template({ children }: { children: ReactNode }) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (isFirstRender) {
      isFirstRender = false;
      return;
    }
    if (prefersReducedMotion()) return;

    const tween = gsap.fromTo(
      sheet,
      { yPercent: 0, display: "flex" },
      {
        yPercent: -100,
        duration: 0.6,
        delay: 0.08,
        ease: "power3.inOut",
        onComplete: () => {
          sheet.style.display = "none";
        },
      },
    );
    return () => {
      tween.kill();
      sheet.style.display = "none";
    };
  }, []);

  return (
    <>
      <div
        ref={sheetRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[95] hidden items-center justify-center bg-brand"
      >
        <Image src="/brand/yeet-logo.png" alt="" width={1080} height={579} className="logo-die-cut h-auto w-40 md:w-56" />
      </div>
      {children}
    </>
  );
}
