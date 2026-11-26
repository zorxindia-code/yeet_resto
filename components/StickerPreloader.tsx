"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { useLenis } from "@/components/SmoothScrollProvider";
import { INTRO_LOGO } from "@/lib/intro";
import { INTRO_SEEN_KEY, whenEssentialsReady } from "@/lib/ready";

/**
 * First-visit intro: a scroll-controlled sticker peel (html[data-intro="play"], set by the inline
 * script in app/layout.tsx on the first homepage load of a session).
 *
 * 1. Solid red sheet, the original logo dead centre, a real loading ring (hydration, fonts and the
 *    hero's main image; capped so nobody is ever trapped).
 * 2. Ready: "Scroll to peel" / "Swipe up to peel".
 * 3. The visitor's own scrolling drives the peel: the logo sticker lifts from its corner and folds
 *    over showing its adhesive backside, then the whole red sheet peels from the bottom-right corner,
 *    revealing the real landing page that has been sitting underneath at the top.
 *
 * The overlay has its own native scroll track (data-lenis-prevent), read by ScrollTrigger with scrub
 * smoothing: the page itself never scrolls during the intro, so the hero, pins and waves are untouched,
 * and there is no second smooth-scroll engine. Everything per frame is direct style/attribute writes.
 */

const LOGO_SRC = INTRO_LOGO.src;
const ASPECT = `${INTRO_LOGO.width} / ${INTRO_LOGO.height}`;
// Plain <img> props from next/image: optimised srcset, without the automatic <link rel="preload">
// (the overlay is hidden on later visits; the inline script preloads it only when the intro plays).
const { props: LOGO_IMG } = getImageProps({ src: LOGO_SRC, width: INTRO_LOGO.width, height: INTRO_LOGO.height, sizes: INTRO_LOGO.sizes, alt: "", loading: "eager" });

type P = [number, number];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0→1 progress of p within [a, b]. */
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// ——— Logo sticker peel (die-cut clip + folded flap), in the logo's own 0–1 box ———
const SAMPLES = 24;
/** Peel boundary v = b(u). Bulges slightly so the moving edge reads as curved paper. */
function boundary(u: number, p: number) {
  const bulge = 0.1 * Math.sin(Math.PI * u) * Math.sin(Math.PI * p);
  return clamp01(2 * (1 - p) - u + bulge);
}
const toClip = (pts: P[]) => `polygon(${pts.map(([u, v]) => `${(u * 100).toFixed(2)}% ${(v * 100).toFixed(2)}%`).join(", ")})`;
function logoClips(p: number) {
  const curve: P[] = [];
  for (let i = 0; i <= SAMPLES; i++) curve.push([i / SAMPLES, boundary(i / SAMPLES, p)]);
  return {
    remain: toClip([[0, 0], [1, 0], ...curve.slice().reverse()]),
    flap: toClip([...curve, [1, 1], [0, 1]]),
    origin: `50% ${(boundary(0.5, p) * 100).toFixed(2)}%`,
  };
}

// ——— Full-screen sheet peel, in viewport px. Fold line perpendicular to the bottom-right → top-left
// diagonal, `f` px from the corner. The lifted part is reflected across the fold (the flap). ———
function clipHalf(poly: P[], side: (pt: P) => number): P[] {
  const out: P[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const fa = side(a);
    const fb = side(b);
    if (fa >= 0) out.push(a);
    if (fa >= 0 !== fb >= 0) {
      const t = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}
const toPath = (pts: P[]) => (pts.length ? `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z` : "");

function sheetGeometry(W: number, H: number, f: number) {
  const L = Math.hypot(W, H);
  const u: P = [-W / L, -H / L]; // from the bottom-right corner towards the top-left
  const s = ([x, y]: P) => (x - W) * u[0] + (y - H) * u[1]; // distance from the corner along u
  const rect: P[] = [[0, 0], [W, 0], [W, H], [0, H]];
  const remain = clipHalf(rect, (pt) => s(pt) - f);
  const lifted = clipHalf(rect, (pt) => f - s(pt));
  const flap = lifted.map((pt): P => {
    const d = 2 * (f - s(pt));
    return [pt[0] + d * u[0], pt[1] + d * u[1]];
  });
  // Thin crease shadow on the revealed page, just behind the fold.
  const crease = clipHalf(clipHalf(rect, (pt) => f - s(pt)), (pt) => s(pt) - (f - 36));
  const at = (dist: number): P => [W + dist * u[0], H + dist * u[1]];
  return { L, remain, flap, crease, fold: at(f), flapEnd: at(2 * f), creaseStart: at(f - 36) };
}

export function StickerPreloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    if (!root || html.dataset.intro !== "play") return;
    registerGsap();
    html.dataset.introJs = "1"; // JavaScript is running: cancel the CSS failsafe

    const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
    const scroller = $("[data-intro-scroller]");
    const track = $("[data-intro-track]");
    const status = $("[data-intro-status]");
    const logoWrap = $("[data-intro-logo]");
    const remain = $("[data-remain]");
    const flap = $("[data-flap]");
    const back = $("[data-back]");
    const sheet = $<SVGPathElement>("[data-sheet]");
    const flapPath = $<SVGPathElement>("[data-sheet-flap]");
    const flapShadow = $<SVGPathElement>("[data-sheet-flap-shadow]");
    const crease = $<SVGPathElement>("[data-sheet-crease]");
    const flapGrad = $<SVGLinearGradientElement>("[data-flap-grad]");
    const creaseGrad = $<SVGLinearGradientElement>("[data-crease-grad]");
    const hint = $("[data-intro-hint]");
    const skip = $<HTMLButtonElement>("[data-intro-skip]");

    let done = false;
    let revealed = false;
    let st: ScrollTrigger | null = null;
    let skipTween: gsap.core.Tween | null = null;
    const state = { p: 0 };

    window.scrollTo(0, 0);
    html.classList.add("intro-lock");
    const raf = requestAnimationFrame(() => lenis?.current?.stop());

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      window.dispatchEvent(new Event("yeet:intro-done")); // the hero's entrance plays as it is uncovered
    };

    const finish = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
      reveal();
      st?.kill();
      skipTween?.kill();
      const hadFocus = root.contains(document.activeElement);
      root.style.display = "none";
      html.dataset.intro = "done";
      html.classList.remove("intro-lock");
      lenis?.current?.start();
      if (hadFocus) document.getElementById("main")?.focus({ preventScroll: true });
    };

    const render = (p: number) => {
      // 0–8%: the instruction clears.
      hint.style.opacity = String(1 - seg(p, 0, 0.08));
      // 2–42%: the logo's corner lifts (linear, so the first lift reads straight away), then the
      // sticker folds over showing its backside.
      const lp = seg(p, 0.02, 0.42);
      const c = logoClips(lp);
      remain.style.clipPath = c.remain;
      // Fully peeled: hide the empty remainder, or the die-cut outline draws a stray white dot.
      remain.style.visibility = lp > 0.985 ? "hidden" : "visible";
      flap.style.clipPath = c.flap;
      flap.style.transformOrigin = c.origin;
      const angle = -165 * lp;
      flap.style.transform = `rotate3d(1, -1, 0, ${angle}deg)`;
      back.style.opacity = String(clamp01((-angle - 60) / 60));
      // 36–58%: the peeled sticker is carried off.
      const away = easeInOut(seg(p, 0.36, 0.58));
      logoWrap.style.transform = `translate(${(-110 * away).toFixed(1)}px, ${(-150 * away).toFixed(1)}px) rotate(${(-16 * away).toFixed(2)}deg)`;
      logoWrap.style.opacity = String(1 - seg(p, 0.48, 0.6));
      // 40–100%: the red sheet peels from the bottom-right corner and uncovers the page.
      const W = window.innerWidth;
      const H = window.innerHeight;
      const sp = easeInOut(seg(p, 0.4, 1));
      const g = sheetGeometry(W, H, sp * Math.hypot(W, H) * 1.04);
      sheet.setAttribute("d", toPath(g.remain.length ? g.remain : []));
      const flapD = toPath(g.flap);
      flapPath.setAttribute("d", flapD);
      flapShadow.setAttribute("d", flapD);
      crease.setAttribute("d", toPath(g.crease));
      flapGrad.setAttribute("x1", g.fold[0].toFixed(1));
      flapGrad.setAttribute("y1", g.fold[1].toFixed(1));
      flapGrad.setAttribute("x2", g.flapEnd[0].toFixed(1));
      flapGrad.setAttribute("y2", g.flapEnd[1].toFixed(1));
      creaseGrad.setAttribute("x1", g.fold[0].toFixed(1));
      creaseGrad.setAttribute("y1", g.fold[1].toFixed(1));
      creaseGrad.setAttribute("x2", g.creaseStart[0].toFixed(1));
      creaseGrad.setAttribute("y2", g.creaseStart[1].toFixed(1));
      if (p > 0.42) reveal();
      if (p >= 0.995) finish();
    };

    const onSkip = () => {
      if (done) return;
      st?.kill();
      st = null;
      if (prefersReducedMotion()) return finish();
      skipTween = gsap.to(state, { p: 1, duration: 1.2 * (1 - state.p) + 0.2, ease: "power2.inOut", onUpdate: () => render(state.p), onComplete: finish });
    };
    skip.addEventListener("click", onSkip);

    // Anything throws → open the site instead of trapping the visitor.
    let cancelled = false;
    try {
      render(0);
      whenEssentialsReady(6000).then(() => {
        if (cancelled || done) return;
        root.dataset.state = "ready";
        status.textContent = "Ready. Scroll down to peel the sticker, or use Skip intro.";
        const timeline = gsap.timeline({ paused: true }).to(state, { p: 1, ease: "none", duration: 1, onUpdate: () => render(state.p) });
        st = ScrollTrigger.create({
          scroller,
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6, // the peel follows the finger/wheel with a short, natural settle
          animation: timeline,
        });
        scroller.focus({ preventScroll: true }); // arrow keys, Space and Page Down peel too
      });
    } catch {
      finish();
    }

    const onResize = () => render(state.p);
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      skip.removeEventListener("click", onSkip);
      st?.kill();
      skipTween?.kill();
      html.classList.remove("intro-lock");
    };
  }, [lenis]);

  return (
    <div ref={rootRef} data-state="loading" className="intro-overlay fixed inset-0 z-[100] overflow-hidden" data-lenis-prevent>
      {/* Peel surface: the red sheet, its reflected flap (adhesive backside with a curl highlight),
          a small contact shadow and a thin crease shadow on the page being uncovered. */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient data-flap-grad id="intro-flap-grad" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#c9bfbd" />
            <stop offset="0.07" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#f4efee" />
            <stop offset="1" stopColor="#dcd3d1" />
          </linearGradient>
          <linearGradient data-crease-grad id="intro-crease-grad" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#000" stopOpacity="0.28" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path data-sheet className="fill-brand" d="M0,0H10000V10000H0Z" />
        <path data-sheet-crease fill="url(#intro-crease-grad)" />
        <path data-sheet-flap-shadow fill="#000" fillOpacity="0.14" transform="translate(5 9)" />
        <path data-sheet-flap fill="url(#intro-flap-grad)" />
      </svg>

      {/* Logo sticker, exactly centred; the status line hangs below it without moving it. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <div data-intro-logo className="relative">
          <div className="logo-die-cut" style={{ perspective: 1100 }}>
            <div className="relative w-[clamp(180px,54vw,220px)] md:w-[300px]" style={{ aspectRatio: ASPECT }}>
              <div data-remain className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- optimised srcset via getImageProps, without Next's auto preload */}
                <img {...LOGO_IMG} alt="" className="h-full w-full" draggable={false} />
              </div>
              <div data-flap className="absolute inset-0" style={{ transformStyle: "preserve-3d", clipPath: "polygon(0 0, 0 0, 0 0)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- optimised srcset via getImageProps, without Next's auto preload */}
                <img {...LOGO_IMG} alt="" className="h-full w-full" draggable={false} />
                {/* Adhesive backside: the same die-cut, flattened to light grey */}
                {/* eslint-disable-next-line @next/next/no-img-element -- optimised srcset via getImageProps, without Next's auto preload */}
                <img {...LOGO_IMG} data-back alt="" className="absolute inset-0 h-full w-full" style={{ filter: "brightness(0) invert(0.94)", opacity: 0 }} draggable={false} />
              </div>
            </div>
          </div>

          <div data-intro-hint className="absolute left-1/2 top-full mt-8 flex -translate-x-1/2 flex-col items-center whitespace-nowrap text-white" aria-hidden="true">
            {/* Loading: a thin ring that spins until the essentials are actually ready */}
            <span className="intro-loading flex flex-col items-center gap-3">
              <svg viewBox="0 0 32 32" className="intro-spinner h-7 w-7">
                <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="22 60" />
              </svg>
              <span className="font-display text-[11px] uppercase tracking-[0.3em]">Good stuff loading…</span>
            </span>
            {/* Ready: the instruction */}
            <span className="intro-ready absolute top-0 flex flex-col items-center gap-2">
              <span className="font-display text-xs uppercase tracking-[0.3em]">
                <span className="intro-label-scroll">Scroll to peel</span>
                <span className="intro-label-swipe">Swipe up to peel</span>
              </span>
              <svg viewBox="0 0 24 24" className="intro-arrow h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Native scroll track that the peel follows (transparent, above the visuals). */}
      <div
        data-intro-scroller
        tabIndex={-1}
        role="region"
        aria-label="Intro. Scroll down, or press the down arrow, to peel the sticker."
        className="intro-scroller absolute inset-0 overflow-hidden overscroll-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div data-intro-track className="h-[calc(100%+70svh)] md:h-[calc(100%+100svh)]" />
      </div>

      <button
        type="button"
        data-intro-skip
        className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-10 rounded-full px-3 py-2 font-display text-xs uppercase tracking-[0.2em] text-white/90 underline-offset-4 hover:underline focus-visible:underline md:right-8"
      >
        Skip intro
      </button>
      <p data-intro-status role="status" className="sr-only">
        Loading the YEET website.
      </p>
    </div>
  );
}
