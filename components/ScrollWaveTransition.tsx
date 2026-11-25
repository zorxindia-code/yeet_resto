"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/motion";

/** Brand surfaces (from the theme tokens). "transparent" lets a photo section show through the wave. */
export type WaveFill = "white" | "paper" | "red" | "transparent";

/**
 * Where the wave band sits relative to the boundary between the two sections:
 * - "both":   straddles it (half in each section's padding).
 * - "top":    entirely inside the section above. Use when the section below is pinned.
 * - "bottom": entirely inside the section below. Use when the section above is pinned or busy.
 */
export type WaveOverlap = "both" | "top" | "bottom";

type Props = {
  /** Colour of the section above the wave. */
  from: WaveFill;
  /** Colour of the section below the wave. */
  to: WaveFill;
  overlap?: WaveOverlap;
  /** Band height in px. The wave never leaves this band. */
  height?: { mobile: number; desktop: number };
  /** 0–1: how much of the band the resting wave uses. */
  amplitude?: number;
  /** 0–1: how far the crests travel as the section scrolls through the viewport. */
  morph?: number;
  /** Which way crests travel while scrolling down. */
  direction?: "left" | "right";
  /** 0–1: extra swell from scroll speed (fast flick = livelier, slow = calm). */
  sensitivity?: number;
  /** Cycles per second of the ambient float while visible. 0 turns it off. */
  ambientSpeed?: number;
  /** Resting silhouette, so neighbouring waves don't look identical. */
  shape?: 0 | 1 | 2;
  /** Render (and animate) on phones only, e.g. below a photo intro that exists only on mobile. */
  only?: "mobile";
  className?: string;
};

const FILL: Record<Exclude<WaveFill, "transparent">, string> = {
  white: "fill-white",
  paper: "fill-paper",
  red: "fill-brand",
};

// Resting offsets per anchor (left → right), as a share of the band's half-height.
const SHAPES = [
  [0.3, -0.55, 0.6, -0.2, -0.6, 0.35],
  [-0.45, 0.4, -0.25, 0.65, -0.35, 0.2],
  [0.5, 0.05, -0.65, 0.3, 0.55, -0.3],
] as const;
// Every anchor drifts at its own rate and phase, so crests never move in lockstep.
const RATES = [0.82, 1.08, 0.94, 1.17, 0.88, 1.02];
const PHASES = [0, 1.9, 3.7, 0.8, 2.6, 4.4];

// viewBox is 1000 × 100, stretched to the band (preserveAspectRatio="none", fills only).
const MID = 50;
const REACH = 44; // furthest a point may travel from the midline
const X0 = -80; // anchors run past both edges so the ends never look pinned
const X1 = 1080;
const TOP = -6; // fills bleed a little past the band so no hairline can show at its edges
const BOTTOM = 106;

type Tuning = { shape: readonly number[]; amplitude: number; morph: number; ambient: number; ambientSpeed: number; dir: 1 | -1 };

/**
 * Anchor points at scroll progress `p`, time `t` (s) and velocity boost `boost`.
 * At p = 0 and t = 0 this is plain arithmetic (no trig), so the server-rendered path
 * is identical in every JS engine and hydration can't mismatch.
 */
function anchors(p: number, t: number, boost: number, k: Tuning): [number, number][] {
  const n = k.shape.length;
  return k.shape.map((rest, i) => {
    const x = X0 + (i * (X1 - X0)) / (n - 1);
    const ph = PHASES[i] + i * 1.1;
    // Travelling wave driven by scroll progress; reverses exactly when scrolling back up.
    const scroll = p === 0 ? 0 : Math.sin(ph - k.dir * p * Math.PI * 1.8 * RATES[i]) - Math.sin(ph);
    // Slow ambient float, each point at a slightly different speed.
    const float = t === 0 ? 0 : Math.sin(ph * 1.7 + t * Math.PI * 2 * k.ambientSpeed * (0.85 + 0.06 * i)) - Math.sin(ph * 1.7);
    const off = Math.max(-1, Math.min(1, rest * 0.7 + scroll * 0.34 * k.morph * (1 + boost) + float * 0.07 * k.ambient));
    return [x, MID + off * REACH * k.amplitude];
  });
}

const f = (v: number) => v.toFixed(2);

/** Smooth curve through the anchors (Catmull-Rom converted to cubic Béziers). */
function curve(pts: [number, number][]): string {
  const n = pts.length;
  const at = (i: number) => pts[Math.max(0, Math.min(n - 1, i))];
  let d = `${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [ax, ay] = at(i - 1);
    const [bx, by] = at(i);
    const [cx, cy] = at(i + 1);
    const [dx, dy] = at(i + 2);
    d += ` C${f(bx + (cx - ax) / 6)},${f(by + (cy - ay) / 6)} ${f(cx - (dx - bx) / 6)},${f(cy - (dy - by) / 6)} ${f(cx)},${f(cy)}`;
  }
  return d;
}

const regions = (pts: [number, number][]) => {
  const c = curve(pts);
  return {
    above: `M${X0},${TOP} L${c} L${X1},${TOP} Z`,
    below: `M${X0},${BOTTOM} L${c} L${X1},${BOTTOM} Z`,
  };
};

const MARGINS: Record<WaveOverlap, CSSProperties> = {
  both: { marginTop: "calc(var(--wave-h) * -0.5)", marginBottom: "calc(var(--wave-h) * -0.5)" },
  top: { marginTop: "calc(var(--wave-h) * -1)" },
  bottom: { marginBottom: "calc(var(--wave-h) * -1)" },
};

/**
 * Organic, scroll-driven wave between two sections. Placed between them in the page flow,
 * it takes up no height (negative margins) and paints over their padding.
 *
 * Motion runs on GSAP's shared ticker (the same frame loop that drives Lenis) and only while
 * the wave is on screen. ScrollTrigger supplies progress and velocity; nothing re-renders.
 * Reduced motion gets the static resting wave.
 */
export function ScrollWaveTransition({
  from,
  to,
  overlap = "both",
  height = { mobile: 76, desktop: 190 },
  amplitude = 0.9,
  morph = 1,
  direction = "right",
  sensitivity = 0.45,
  ambientSpeed = 0.12,
  shape = 0,
  only,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const aboveRef = useRef<SVGPathElement>(null);
  const belowRef = useRef<SVGPathElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // Paint only what the other section needs. In "top" mode the section above shows itself
  // above the wave; in "bottom" mode the section below shows itself beneath it.
  const paintAbove = from !== "transparent" && overlap !== "top";
  const paintBelow = to !== "transparent" && overlap !== "bottom";
  const split = overlap === "both"; // each colour is clipped to the other section's half (1-unit overlap hides seams)

  const tuning: Tuning = { shape: SHAPES[shape], amplitude, morph, ambient: 1, ambientSpeed, dir: direction === "right" ? 1 : -1 };
  const initial = regions(anchors(0, 0, 0, tuning));

  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add({ desktop: "(min-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
      if (only === "mobile" && desktop) return; // hidden (display: none) above the phone breakpoint
      // Phones: smaller, calmer wave (the band is also shorter via CSS).
      const k: Tuning = {
        shape: SHAPES[shape],
        amplitude: amplitude * (desktop ? 1 : 0.85),
        morph: morph * (desktop ? 1 : 0.75),
        ambient: desktop ? 1 : 0.6,
        ambientSpeed,
        dir: direction === "right" ? 1 : -1,
      };
      const draw = (p: number, t: number, boost: number) => {
        const r = regions(anchors(p, t, boost, k));
        aboveRef.current?.setAttribute("d", r.above);
        belowRef.current?.setAttribute("d", r.below);
      };
      draw(0, 0, 0);
      if (reduce) return;

      let target = 0; // raw scroll progress through the viewport
      let progress = 0; // eased progress (settles smoothly when scrolling stops)
      let velTarget = 0;
      let vel = 0;
      let time = 0;
      let running = false;

      const tick = (_: number, deltaMs: number) => {
        const dt = Math.min(deltaMs / 1000, 0.05);
        time += dt;
        velTarget *= Math.exp(-dt * 3); // no scroll events → the swell fades out
        progress += (target - progress) * (1 - Math.exp(-dt * 5));
        vel += (velTarget - vel) * (1 - Math.exp(-dt * (velTarget > vel ? 6 : 2)));
        draw(progress, ambientSpeed > 0 ? time : 0, vel * sensitivity);
      };
      const run = (on: boolean) => {
        if (on === running) return;
        running = on;
        if (on) gsap.ticker.add(tick);
        else gsap.ticker.remove(tick);
      };

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        // Measured after the pinned sections above have added their spacing.
        refreshPriority: -1,
        onUpdate: (self) => {
          target = self.progress;
          velTarget = Math.max(velTarget, Math.min(1, Math.abs(self.getVelocity()) / 2600));
        },
        onToggle: (self) => run(self.isActive),
      });
      target = st.progress;
      run(st.isActive);
      return () => run(false);
    });
    return () => mm.revert();
  }, [amplitude, morph, direction, sensitivity, ambientSpeed, shape, only]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-wave
      className={`pointer-events-none relative z-20 w-full overflow-x-clip ${only === "mobile" ? "md:hidden" : ""} [--wave-h:var(--wave-m)] md:[--wave-h:var(--wave-d)] ${className}`}
      style={
        {
          "--wave-m": `${height.mobile}px`,
          "--wave-d": `${height.desktop}px`,
          height: "var(--wave-h)",
          ...MARGINS[overlap],
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" focusable="false">
        {split ? (
          <defs>
            <clipPath id={`${uid}-a`}>
              <rect x={X0} y={MID - 1} width={X1 - X0} height={BOTTOM - MID + 1} />
            </clipPath>
            <clipPath id={`${uid}-b`}>
              <rect x={X0} y={TOP} width={X1 - X0} height={MID + 1 - TOP} />
            </clipPath>
          </defs>
        ) : null}
        {paintAbove ? (
          <path ref={aboveRef} d={initial.above} className={FILL[from as keyof typeof FILL]} clipPath={split ? `url(#${uid}-a)` : undefined} />
        ) : null}
        {paintBelow ? (
          <path ref={belowRef} d={initial.below} className={FILL[to as keyof typeof FILL]} clipPath={split ? `url(#${uid}-b)` : undefined} />
        ) : null}
      </svg>
    </div>
  );
}
