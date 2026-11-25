"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Draggable } from "gsap/Draggable";
import { gsap, registerGsap, prefersReducedMotion, ScrollTrigger } from "@/lib/motion";
import { FoodIcon, type FoodIconName } from "@/components/icons/FoodIcons";

type Sticker =
  | { kind: "icon"; id: string; icon: FoodIconName; label: string; left: number; top: number; size: number; rot: number }
  | { kind: "text"; id: string; text: string; left: number; top: number; rot: number };

const STICKERS: Sticker[] = [
  { kind: "icon", id: "burger", icon: "burger", label: "Burger", left: 6, top: 10, size: 150, rot: -10 },
  { kind: "icon", id: "drumstick", icon: "drumstick", label: "Chicken leg", left: 82, top: 8, size: 130, rot: 12 },
  { kind: "icon", id: "wings", icon: "wings", label: "Chicken wings", left: 66, top: 62, size: 150, rot: -6 },
  { kind: "icon", id: "wrap", icon: "wrap", label: "Zinger wrap", left: 3, top: 60, size: 135, rot: 8 },
  { kind: "icon", id: "fries", icon: "fries", label: "Fries", left: 88, top: 40, size: 120, rot: -8 },
  { kind: "icon", id: "popcorn", icon: "popcorn", label: "Popcorn", left: 30, top: 74, size: 115, rot: 10 },
  { kind: "icon", id: "juice", icon: "juice", label: "Juice", left: 42, top: 6, size: 110, rot: -4 },
  { kind: "icon", id: "soda", icon: "soda", label: "Soft drink", left: 18, top: 36, size: 105, rot: 6 },
  { kind: "icon", id: "sauce", icon: "sauce", label: "Sauce bottle", left: 74, top: 24, size: 96, rot: -14 },
  { kind: "text", id: "yeet", text: "YEET IT!", left: 24, top: 22, rot: -6 },
  { kind: "text", id: "bite", text: "BITE ME!", left: 58, top: 42, rot: 5 },
  { kind: "text", id: "mood", text: "GOOD MOOD!", left: 6, top: 86, rot: -3 },
  { kind: "text", id: "crunch", text: "CRUNCH TIME!", left: 50, top: 86, rot: 4 },
  { kind: "text", id: "more", text: "MORE PLEASE!", left: 40, top: 52, rot: -4 },
  { kind: "text", id: "good", text: "TOO GOOD!", left: 84, top: 84, rot: 7 },
];

/**
 * Interactive sticker canvas. Stickers are draggable (GSAP Draggable, bounded to the
 * canvas), bring to front on press, rotate via double-click / R / button, and drop
 * back with an impact settle. The logo and controls sit outside the drag layer.
 */
export function StickerPlayground() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLElement | null>(null);
  const dropRef = useRef<(() => void) | null>(null);
  const resetRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    registerGsap();
    gsap.registerPlugin(Draggable);
    const canvas = canvasRef.current;
    const logo = logoRef.current;
    if (!canvas || !logo) return;
    const els = Array.from(canvas.querySelectorAll<HTMLElement>("[data-sticker]"));
    const reduce = prefersReducedMotion();
    const rotations = els.map((el) => Number(el.dataset.rot ?? 0));
    gsap.set(els, { rotation: (i: number) => rotations[i] });
    let z = 10;

    const impact = (el: HTMLElement) => gsap.fromTo(el, { scale: 1.08 }, { scale: 1, duration: 0.5, ease: "back.out(2.5)" });

    const drags = Draggable.create(els, {
      bounds: canvas,
      cursor: "grab",
      activeCursor: "grabbing",
      onPress(this: Draggable) {
        z += 1;
        (this.target as HTMLElement).style.zIndex = String(z);
        selectedRef.current = this.target as HTMLElement;
      },
      onDragEnd(this: Draggable) {
        impact(this.target as HTMLElement);
      },
    });

    const rotate = (el: HTMLElement, by: number) => gsap.to(el, { rotation: `+=${by}`, duration: 0.4, ease: "back.out(1.6)" });
    const bringFront = (el: HTMLElement) => {
      z += 1;
      el.style.zIndex = String(z);
      selectedRef.current = el;
    };

    // Keyboard: arrows nudge, R rotates, Enter brings to front. Clamped to the canvas.
    const keyHandlers = els.map((el) => {
      const onKey = (e: KeyboardEvent) => {
        const step = e.shiftKey ? 40 : 14;
        const moves: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        };
        if (moves[e.key]) {
          e.preventDefault();
          const [dx, dy] = moves[e.key];
          const c = canvas.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          const nx = Math.min(Math.max(dx, c.left - r.left), c.right - r.right);
          const ny = Math.min(Math.max(dy, c.top - r.top), c.bottom - r.bottom);
          gsap.to(el, { x: `+=${nx}`, y: `+=${ny}`, duration: 0.25, ease: "power2.out" });
        } else if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          rotate(el, 15);
        } else if (e.key === "Enter") {
          e.preventDefault();
          bringFront(el);
        }
      };
      const onFocus = () => bringFront(el);
      const onDbl = () => rotate(el, 20);
      el.addEventListener("keydown", onKey);
      el.addEventListener("focus", onFocus);
      el.addEventListener("dblclick", onDbl);
      return () => {
        el.removeEventListener("keydown", onKey);
        el.removeEventListener("focus", onFocus);
        el.removeEventListener("dblclick", onDbl);
      };
    });

    const drop = () => {
      gsap.fromTo(
        els,
        { y: (i: number) => -700 - i * 60, rotation: (i: number) => rotations[i] - 60, opacity: 0 },
        { y: 0, rotation: (i: number) => rotations[i], opacity: 1, duration: 1.1, ease: "back.out(1.2)", stagger: 0.07 },
      );
    };
    const reset = () => {
      els.forEach((el, i) => {
        gsap.to(el, { x: 0, y: 0, rotation: rotations[i], scale: 1, duration: 0.7, ease: "back.out(1.4)" });
      });
    };
    dropRef.current = drop;
    resetRef.current = reset;

    const ctx = gsap.context(() => {
      if (reduce) return;
      gsap.set(els, { opacity: 0 });
      gsap.set(logo, { opacity: 0 });
      ScrollTrigger.create({
        trigger: canvas,
        start: "top 80%",
        once: true,
        onEnter: () => {
          drop();
          gsap.fromTo(logo, { scale: 1.5, rotation: -6, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: "power4.out", delay: 0.6 });
        },
      });
    }, canvas);
    if (reduce) gsap.set(logo, { opacity: 1 });

    return () => {
      keyHandlers.forEach((off) => off());
      drags.forEach((d) => d.kill());
      ctx.revert();
      dropRef.current = null;
      resetRef.current = null;
    };
  }, []);

  return (
    <div className="relative bg-white">
      <div
        ref={canvasRef}
        className="sp-canvas relative mx-auto h-[min(82svh,780px)] min-h-[600px] w-full overflow-hidden paper-texture md:min-h-[680px]"
        role="region"
        aria-label="Sticker playground. Drag stickers around, or focus one and use arrow keys. R rotates."
      >
        <div className="absolute left-4 top-4 z-[60] flex flex-wrap gap-2 md:left-8 md:top-6">
          <button
            type="button"
            onClick={() => resetRef.current?.()}
            className="sticker-label rounded-full bg-brand px-4 py-2 text-sm text-white"
            data-cursor="drag"
          >
            Reset stickers
          </button>
          <button
            type="button"
            onClick={() => dropRef.current?.()}
            className="sticker-label rounded-full border-2 border-brand px-4 py-2 text-sm text-brand"
            data-cursor="drag"
          >
            Drop again
          </button>
          <button
            type="button"
            onClick={() => selectedRef.current && gsap.to(selectedRef.current, { rotation: "+=20", duration: 0.4, ease: "back.out(1.6)" })}
            className="sticker-label rounded-full border-2 border-brand px-4 py-2 text-sm text-brand"
          >
            Rotate selected
          </button>
        </div>

        {/* Oversized logo: non-draggable, sits behind the stickers */}
        <div ref={logoRef} className="pointer-events-none absolute left-1/2 top-1/2 z-[1] w-[min(72%,620px)] -translate-x-1/2 -translate-y-1/2 select-none">
          <Image src="/brand/yeet-logo.png" alt="" width={1080} height={579} sizes="(min-width: 900px) 620px, 72vw" className="sticker-edge h-auto w-full" />
        </div>

        {STICKERS.map((s) => {
          const width = s.kind === "icon" ? `calc(${s.size}px * var(--sp-scale))` : undefined;
          const common = {
            "data-sticker": "",
            "data-rot": s.rot,
            tabIndex: 0,
            role: "button" as const,
            "aria-label": `${s.kind === "icon" ? s.label : s.text}. Drag, or use arrow keys. Press R to rotate.`,
            className: "absolute z-[5] select-none outline-none focus-visible:ring-4 focus-visible:ring-brand/40 rounded-2xl",
            style: { left: `${s.left}%`, top: `${s.top}%`, width, touchAction: "none" as const },
          };
          if (s.kind === "icon") {
            return (
              <div key={s.id} {...common}>
                <FoodIcon name={s.icon} className="sticker-edge h-auto w-full pointer-events-none" />
              </div>
            );
          }
          return (
            <div key={s.id} {...common} style={{ ...common.style, width: undefined }}>
              <span className="sticker-label die-cut inline-block whitespace-nowrap bg-brand px-4 py-2 text-[clamp(1rem,2.2vw,1.6rem)] text-white">
                {s.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
