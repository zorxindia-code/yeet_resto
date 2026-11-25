"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion";

const LABELS = ["BITE ME", "PEEL", "DRAG", "EXPLORE", "VIEW"] as const;

/**
 * Desktop-only branded cursor. Disabled on touch/coarse pointers.
 * Native pointer is kept for forms, nav and essential controls; only elements
 * marked with [data-cursor] hide the native pointer and show the badge.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => {
      setEnabled(mq.matches);
      document.body.classList.toggle("has-custom-cursor", mq.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  useEffect(() => {
    if (!enabled || !dotRef.current) return;
    const el = dotRef.current;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      if (!target) return setLabel(null);
      const requested = target.dataset.cursor?.toUpperCase();
      setLabel(LABELS.find((l) => l === requested) ?? requested ?? "VIEW");
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[150] -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className={`flex items-center justify-center rounded-full bg-white font-display text-[11px] uppercase tracking-wider text-brand shadow-[0_4px_12px_-4px_rgba(0,0,0,0.4)] transition-[width,height,opacity] duration-200 ${
          label ? "h-16 w-16 opacity-100" : "h-3 w-3 bg-brand opacity-80 ring-2 ring-white"
        }`}
      >
        {label}
      </div>
    </div>
  );
}
