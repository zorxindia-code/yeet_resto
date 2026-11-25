"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/motion";
import { FoodIcon, type FoodIconName } from "@/components/icons/FoodIcons";

/**
 * Cinematic sticker-peel intro. Plays once per session (html[data-intro="play"],
 * set by an inline script before paint). Total ≈2.3s, then the hero takes over
 * via the `yeet:intro-done` event so the hand-off feels continuous.
 */

type Piece = {
  icon: FoodIconName;
  left: string;
  top: string;
  size: number;
  from: [number, number];
  rot: number;
  origin: string; // corner the sticker peels from
  peel: [number, number];
};

const PIECES: Piece[] = [
  { icon: "burger", left: "12%", top: "18%", size: 128, from: [-420, -260], rot: -14, origin: "0% 0%", peel: [-260, -240] },
  { icon: "drumstick", left: "76%", top: "68%", size: 118, from: [420, 300], rot: 12, origin: "100% 100%", peel: [240, 260] },
  { icon: "fries", left: "84%", top: "16%", size: 116, from: [380, -300], rot: 10, origin: "100% 0%", peel: [40, -340] }, // curls up
  { icon: "pizza", left: "8%", top: "72%", size: 124, from: [-380, 320], rot: -10, origin: "0% 100%", peel: [-320, 40] }, // sideways
  { icon: "juice", left: "50%", top: "8%", size: 104, from: [0, -420], rot: 6, origin: "50% 0%", peel: [200, -260] }, // diagonal
];

const LOGO_SRC = "/brand/yeet-logo.png";
const ASPECT = "1080 / 579";
const SAMPLES = 24;

type P = [number, number];

/** Boundary v = b(u) of the peel line. Bulges slightly so the edge reads as curved paper. */
function boundary(u: number, p: number) {
  const bulge = 0.1 * Math.sin(Math.PI * u) * Math.sin(Math.PI * p);
  const b = 2 * (1 - p) - u + bulge;
  return Math.min(1, Math.max(0, b));
}

function toClip(points: P[]) {
  return `polygon(${points.map(([u, v]) => `${(u * 100).toFixed(2)}% ${(v * 100).toFixed(2)}%`).join(", ")})`;
}

/** Clip paths for the still part (above the curve) and the lifted part (below it). */
function peelClips(p: number) {
  const curve: P[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const u = i / SAMPLES;
    curve.push([u, boundary(u, p)]);
  }
  const remain: P[] = [[0, 0], [1, 0], ...curve.slice().reverse()];
  const flap: P[] = [...curve, [1, 1], [0, 1]];
  return { remain: toClip(remain), flap: toClip(flap), origin: `50% ${(boundary(0.5, p) * 100).toFixed(2)}%` };
}

const LOGO_SIZES = "(min-width: 940px) 620px, 66vw";

export function StickerPreloader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || document.documentElement.dataset.intro !== "play") return;
    registerGsap();

    const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
    const stickers = Array.from(root.querySelectorAll<HTMLElement>("[data-piece]"));
    const logo = q("[data-logo]");
    const remain = q("[data-remain]");
    const flap = q("[data-flap]");
    const back = q("[data-back]");
    const shadow = q("[data-shadow]");
    const label = q("[data-label]");

    const finish = () => {
      window.dispatchEvent(new Event("yeet:intro-done"));
      root.style.display = "none";
    };
    // Safety valve: never block the page if the timeline stalls.
    const safety = window.setTimeout(finish, 4000);

    const ctx = gsap.context(() => {
      gsap.set(stickers, { transformOrigin: (i: number) => PIECES[i].origin });
      const peelState = { p: 0 };
      const applyPeel = () => {
        const c = peelClips(peelState.p);
        remain.style.clipPath = c.remain;
        flap.style.clipPath = c.flap;
        flap.style.transformOrigin = c.origin;
        const angle = -165 * peelState.p;
        flap.style.transform = `rotate3d(1, -1, 0, ${angle}deg)`;
        flap.style.filter = `brightness(${(1 - 0.22 * peelState.p).toFixed(3)})`;
        back.style.opacity = String(Math.min(1, Math.max(0, (-angle - 60) / 60)));
      };
      applyPeel();

      const tl = gsap.timeline({ onComplete: () => { window.clearTimeout(safety); finish(); } });

      // Stage 1 — stickers fly in from different directions with momentum.
      tl.fromTo(
        stickers,
        {
          x: (i: number) => PIECES[i].from[0],
          y: (i: number) => PIECES[i].from[1],
          rotation: (i: number) => PIECES[i].rot * 3,
          scale: 0.7,
          opacity: 0,
        },
        { x: 0, y: 0, rotation: (i: number) => PIECES[i].rot, scale: 1, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.08 },
        0,
      );
      tl.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);

      // Stage 2 — the logo lands as an oversized sticker with a controlled slap.
      tl.fromTo(
        logo,
        { scale: 1.7, rotation: -9, y: -40, opacity: 0 },
        { scale: 1, rotation: 0, y: 0, opacity: 1, duration: 0.42, ease: "power4.out" },
        0.45,
      );
      tl.to(logo, { scaleX: 1.04, scaleY: 0.95, duration: 0.08, ease: "power1.out" }, ">-0.04");
      tl.to(logo, { scaleX: 1, scaleY: 1, duration: 0.3, ease: "power2.out" }, ">");
      tl.fromTo(shadow, { scale: 1.25, opacity: 0.4 }, { scale: 1, opacity: 0.18, duration: 0.45, ease: "power2.out" }, 0.45);
      tl.to(label, { opacity: 0, duration: 0.2 }, 0.95);

      // Stage 3 — surrounding stickers peel away from their own corners.
      tl.to(
        stickers,
        {
          x: (i: number) => PIECES[i].peel[0],
          y: (i: number) => PIECES[i].peel[1],
          rotation: (i: number) => PIECES[i].rot + 38,
          rotationX: 42,
          scale: 0.9,
          opacity: 0,
          duration: 0.7,
          ease: "power2.in",
          stagger: 0.05,
        },
        1.0,
      );

      // Stage 4 — the main logo peels along its own silhouette (clip + folded flap).
      tl.to(peelState, { p: 1, duration: 0.7, ease: "power2.inOut", onUpdate: applyPeel }, 1.35);
      tl.to(shadow, { opacity: 0, duration: 0.5 }, 1.5);

      // Stage 5 — hand off to the hero while the red surface fades away.
      tl.add(() => window.dispatchEvent(new Event("yeet:intro-done")), 1.9);
      tl.to(root, { opacity: 0, duration: 0.45, ease: "power1.out" }, 1.95);
    }, root);

    return () => {
      window.clearTimeout(safety);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="intro-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-brand">
      <span className="sr-only" role="status">GOOD STUFF LOADING…</span>

      {PIECES.map((piece) => (
        <div key={piece.icon} data-piece className="absolute" style={{ left: piece.left, top: piece.top, width: piece.size }}>
          <FoodIcon name={piece.icon} className="sticker-edge h-auto w-full" />
        </div>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="logo-die-cut" style={{ perspective: 1100 }}>
          <div data-logo className="relative w-[min(66vw,620px)]" style={{ aspectRatio: ASPECT }}>
            <div data-shadow className="absolute inset-x-10 -bottom-7 h-8 rounded-[50%] bg-black/30 blur-md" />
            <div data-remain className="absolute inset-0" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}>
              <Image src={LOGO_SRC} alt="" width={1080} height={579} sizes={LOGO_SIZES} loading="lazy" className="h-full w-full" draggable={false} />
            </div>
            <div data-flap className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
              <Image src={LOGO_SRC} alt="" width={1080} height={579} sizes={LOGO_SIZES} loading="lazy" className="h-full w-full" draggable={false} />
              {/* Adhesive backside: the same artwork flattened to a light-grey silhouette */}
              <Image
                data-back
                src={LOGO_SRC}
                alt=""
                width={1080}
                height={579}
                sizes={LOGO_SIZES}
                loading="lazy"
                className="absolute inset-0 h-full w-full"
                style={{ filter: "brightness(0) invert(0.94)", opacity: 0 }}
                draggable={false}
              />
            </div>
          </div>
        </div>

        <p data-label className="font-display text-lg uppercase tracking-[0.25em] text-white" aria-hidden="true">
          Good stuff loading…
        </p>
      </div>
    </div>
  );
}
