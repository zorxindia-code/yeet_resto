"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { BurgerIllustration } from "@/components/illustrations/BurgerIllustration";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/assets";

/**
 * The illustrated sticker sits on top of the photograph. Dragging (or scrolling,
 * or using the arrow keys) peels the illustration away from left to right, with a
 * curled edge that follows the boundary. Progress is written to a CSS variable
 * directly so no React re-renders happen during the interaction.
 */
export function StickerRealityReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    let userTouched = false;
    const setP = (v: number) => {
      const p = Math.min(1, Math.max(0, v));
      stage.style.setProperty("--p", p.toFixed(4));
      stage.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    };
    setP(0.12);

    const reduce = prefersReducedMotion();
    const st = reduce
      ? null
      : ScrollTrigger.create({
          trigger: section,
          start: "top 65%",
          end: "bottom 35%",
          onUpdate: (self) => {
            if (!userTouched) setP(0.12 + self.progress * 0.55);
          },
        });

    const fromClientX = (clientX: number) => {
      const r = stage.getBoundingClientRect();
      setP((clientX - r.left) / r.width);
    };
    let dragging = false;
    const down = (e: PointerEvent) => {
      dragging = true;
      userTouched = true;
      stage.setPointerCapture(e.pointerId);
      fromClientX(e.clientX);
    };
    const move = (e: PointerEvent) => dragging && fromClientX(e.clientX);
    const up = (e: PointerEvent) => {
      dragging = false;
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    };
    const key = (e: KeyboardEvent) => {
      const cur = parseFloat(stage.style.getPropertyValue("--p") || "0");
      userTouched = true;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") setP(cur + 0.05);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") setP(cur - 0.05);
      else if (e.key === "Home") setP(0);
      else if (e.key === "End") setP(1);
      else return;
      e.preventDefault();
    };

    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("keydown", key);

    return () => {
      st?.kill();
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("keydown", key);
    };
  }, []);

  return (
    <section ref={sectionRef} id="reveal" data-surface="white" aria-labelledby="reveal-title" className="surface-white relative overflow-hidden py-24 md:py-36">
      <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1440px] items-center gap-12 px-5 md:px-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="font-display text-sm uppercase tracking-[0.25em] text-brand">Peel it</p>
          <h2 id="reveal-title" className="mt-3 font-display text-[clamp(3rem,8vw,7.5rem)] uppercase leading-[0.86] text-brand">
            From sticker<br />to sizzle.
          </h2>
          <p className="mt-6 max-w-md font-body text-lg text-ink/80">
            Every YEET burger starts as a sticker. Peel it back to see the real thing.
          </p>
          <p className="mt-4 font-body text-sm text-ink/60">
            Drag the peel, swipe it, scroll past it, or focus the control and use the arrow keys.
          </p>
        </div>

        <div className="lg:col-span-7">
          <div
            ref={stageRef}
            role="slider"
            tabIndex={0}
            aria-label="Peel the sticker to reveal the real burger"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={12}
            aria-valuetext="Sticker illustration covering the photo"
            data-cursor="peel"
            className="relative mx-auto w-full max-w-[560px] cursor-ew-resize touch-none select-none overflow-hidden rounded-[36px] bg-white shadow-[0_30px_50px_-30px_rgba(0,0,0,0.45)] [--p:0.12] focus-visible:outline-brand"
          >
            <Photo
              src={PHOTOS.revealBurger}
              alt="The real YEET burger"
              label="Real burger photo, same angle and framing as the illustration"
              ratio="1 / 1"
              className="block h-auto w-full rounded-[36px]"
              sizes="(min-width: 1024px) 560px, 90vw"
            />

            {/* Illustrated sticker layer, clipped from the left by --p */}
            <div
              aria-hidden="true"
              className="paper-texture absolute inset-0 bg-white"
              style={{ clipPath: "inset(0 0 0 calc(var(--p) * 100%))" }}
            >
              <BurgerIllustration className="h-full w-full" />
              <span className="sticker-label absolute right-5 top-5 rounded-full bg-brand px-3 py-1.5 text-xs text-white">Sticker</span>
            </div>
            <span
              aria-hidden="true"
              className="sticker-label pointer-events-none absolute left-5 top-5 rounded-full bg-white px-3 py-1.5 text-xs text-brand shadow-md"
              style={{ opacity: "clamp(0, calc((var(--p) - 0.22) * 6), 1)" }}
            >
              Real food
            </span>

            {/* Soft shadow the lifted sticker casts onto the photo */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-6 -translate-x-full"
              style={{
                left: "calc(var(--p) * 100%)",
                background: "linear-gradient(to left, rgba(0,0,0,0.16), rgba(0,0,0,0))",
                opacity: "min(1, calc(var(--p) * 12), calc((1 - var(--p)) * 12))",
              }}
            />
            {/* Curled-back sticker: the adhesive backside rolled over the remaining illustration */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-[clamp(28px,7%,56px)]"
              style={{
                left: "calc(var(--p) * 100%)",
                background: "linear-gradient(90deg, #d6d0ce 0%, #f4f2f1 30%, #ffffff 52%, #ebe7e5 82%, #dcd6d4 100%)",
                borderRadius: "0 999px 999px 0 / 0 40px 40px 0",
                boxShadow: "10px 0 16px -8px rgba(0,0,0,0.28)",
                opacity: "min(1, calc(var(--p) * 12), calc((1 - var(--p)) * 12))",
              }}
            />

            <span
              aria-hidden="true"
              className="sticker-label pointer-events-none absolute top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white ring-4 ring-white md:h-16 md:w-16"
              style={{ left: "calc(var(--p) * 100%)" }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
