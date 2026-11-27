"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { useLenis } from "@/components/SmoothScrollProvider";
import { INTRO_LOGO } from "@/lib/intro";
import { INTRO_SEEN_KEY, heroImagesReady, imageReady } from "@/lib/ready";

/**
 * Homepage loading screen. It only mounts on "/", and runs when html[data-intro] is "play" (first
 * homepage visit of a session) or "refresh" (later full loads). The inline script in app/layout.tsx
 * sets that attribute before first paint.
 *
 * The YEET logo is the loading indicator. A faint white silhouette shows first, then the original
 * red-and-white artwork fills in from the bottom edge upward. The fill is the logo's own pixels (a
 * second copy of the same image whose clip edge rises), so it follows the real silhouette.
 *
 * Progress comes from readiness milestones, never a download percentage. The fill eases to each one
 * as it is reached. When all are reached, or the fallback timeout fires, the logo fills the rest of
 * the way, settles up slightly, and one sticker peel uncovers the homepage underneath. Nothing waits
 * for the rest of the page.
 */

const { props: LOGO_IMG } = getImageProps({
  src: INTRO_LOGO.src,
  width: INTRO_LOGO.width,
  height: INTRO_LOGO.height,
  sizes: INTRO_LOGO.sizes,
  alt: "",
  loading: "eager",
});
const ASPECT = `${INTRO_LOGO.width} / ${INTRO_LOGO.height}`;

// Timings by visit type. "play" is the first homepage visit of a session; "refresh" is a later load.
// `omega` is the fill's spring stiffness: higher settles faster (roughly 4 / omega seconds per step).
const TIMING = {
  play: { omega: 9, minSpeed: 0.8, peel: 1.0, fallbackMs: 4000 },
  refresh: { omega: 15, minSpeed: 1.6, peel: 0.6, fallbackMs: 3000 },
} as const;

type P = [number, number];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0→1 progress of p within [a, b]. */
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// ——— The peel, in viewport px. One fold line, perpendicular to the bottom-right → top-left diagonal,
// `f` px from the corner. The lifted part is reflected across the fold: the curled backside flap. ———
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
const toPolygon = (pts: P[]) => (pts.length ? `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})` : "polygon(0 0, 0 0, 0 0)");
const toPath = (pts: P[]) => (pts.length ? `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z` : "");

const CURL_MAX = 240; // px: deepest the visible curl gets

function sheetGeometry(W: number, H: number, f: number) {
  const L = Math.hypot(W, H);
  const u: P = [-W / L, -H / L]; // from the bottom-right corner towards the top-left
  const s = ([x, y]: P) => (x - W) * u[0] + (y - H) * u[1]; // distance from the corner along u
  const rect: P[] = [[0, 0], [W, 0], [W, H], [0, H]];
  const remain = clipHalf(rect, (pt) => s(pt) - f);
  const lifted = clipHalf(rect, (pt) => f - s(pt));
  // A peeled sticker curls up off the surface rather than lying flat, so the backside is the lifted
  // part reflected and foreshortened into a narrow curl just past the fold (never a big grey slab).
  const curl = f > 0 ? Math.min(0.32, CURL_MAX / f) : 0.32;
  const flap = lifted.map((pt): P => {
    const d = (1 + curl) * (f - s(pt));
    return [pt[0] + d * u[0], pt[1] + d * u[1]];
  });
  // Thin crease shadow on the revealed page, just behind the fold.
  const crease = clipHalf(clipHalf(rect, (pt) => f - s(pt)), (pt) => s(pt) - (f - 36));
  const at = (dist: number): P => [W + dist * u[0], H + dist * u[1]];
  return { remain, flap, crease, fold: at(f), flapEnd: at(f + curl * f), creaseStart: at(f - 36) };
}

export function LogoPreloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    const mode = html.dataset.intro;
    if (!root || (mode !== "play" && mode !== "refresh")) return;
    const timing = TIMING[mode];
    const reduce = prefersReducedMotion();
    html.dataset.introJs = "1"; // JavaScript is running: cancel the CSS failsafe

    const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
    const sheet = $("[data-sheet]");
    const logo = $("[data-logo]");
    const fillImg = $<HTMLImageElement>("[data-fill]");
    const flapPath = $<SVGPathElement>("[data-sheet-flap]");
    const flapShadow = $<SVGPathElement>("[data-sheet-flap-shadow]");
    const crease = $<SVGPathElement>("[data-sheet-crease]");
    const flapGrad = $<SVGLinearGradientElement>("[data-flap-grad]");
    const creaseGrad = $<SVGLinearGradientElement>("[data-crease-grad]");
    const skip = $<HTMLButtonElement>("[data-skip]");

    // v: shown fill (0 = unfilled silhouette, 1 = full logo). target: share of milestones reached.
    const fill = { v: 0, vel: 0, target: 0 };
    const peelState = { p: 0 };
    let active = true; // false once finished or torn down: no further callbacks act
    let completing = false;
    let revealed = false;
    let peelTween: gsap.core.Tween | null = null;
    let fallback = 0;
    let lastClip = "";

    const renderFill = () => {
      // The artwork stays put; only the clip's top edge rises, so the fill follows the logo's own pixels.
      // Sides and bottom extend 4px so the die-cut rim (drawn outside the image box) is not cut off.
      const clip = fill.v >= 1 ? "inset(-4px)" : `inset(${((1 - fill.v) * 100).toFixed(2)}% -4px -4px -4px)`;
      if (clip !== lastClip) fillImg.style.clipPath = lastClip = clip;
    };

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      window.dispatchEvent(new Event("yeet:intro-done")); // the hero's entrance starts as the page is uncovered
    };

    const finish = () => {
      if (!active) return;
      active = false;
      reveal();
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {}
      window.clearTimeout(fallback);
      gsap.ticker.remove(tick);
      peelTween?.kill();
      const hadFocus = root.contains(document.activeElement);
      root.style.display = "none";
      html.dataset.intro = "done";
      html.classList.remove("intro-lock");
      lenis?.current?.start();
      if (hadFocus) document.getElementById("main")?.focus({ preventScroll: true });
    };

    const renderPeel = (p: number) => {
      // The logo settles up slightly as the edge starts to lift, then travels with the sheet.
      logo.style.transform = `scale(${(1 + 0.05 * easeInOut(seg(p, 0, 0.3))).toFixed(4)})`;
      // One fold: gentle at first (the corner lifts), then steady, so it reads as a single pull.
      const W = window.innerWidth;
      const H = window.innerHeight;
      const t = seg(p, 0.18, 1);
      const g = sheetGeometry(W, H, Math.pow(t, 1.5) * Math.hypot(W, H) * 1.04);
      sheet.style.clipPath = toPolygon(g.remain);
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
      if (p > 0.3) reveal();
    };

    // The fill follows its target on a critically damped spring (on GSAP's shared ticker): its speed
    // changes smoothly when milestones arrive close together, it never overshoots or goes backwards.
    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 30);
      const w = timing.omega;
      fill.vel += (w * w * (fill.target - fill.v) - 2 * w * fill.vel) * dt;
      // A minimum speed so the spring's long tail never makes the last few percent crawl.
      fill.v = Math.min(fill.target, fill.v + Math.max(fill.vel * dt, timing.minSpeed * dt));
      if (fill.target - fill.v < 0.002) {
        fill.v = fill.target;
        fill.vel = 0;
      }
      renderFill();
      if (completing && fill.v >= 1) {
        gsap.ticker.remove(tick);
        peel();
      }
    };

    const peel = () => {
      peelTween = gsap.to(peelState, {
        p: 1,
        duration: timing.peel,
        ease: "power2.inOut",
        onUpdate: () => renderPeel(peelState.p),
        onComplete: finish,
      });
    };

    // Everything needed is ready, or the fallback fired, or the visitor skipped: finish the fill, then peel once.
    const complete = () => {
      if (!active || completing) return;
      completing = true;
      window.clearTimeout(fallback);
      skip.disabled = true;
      if (reduce) return finish(); // reduced motion: the full logo is already shown, so just open the page
      fill.target = 1; // the ticker fills the rest of the logo, then starts the peel
    };

    let cancelRaf = 0;
    let heldLenis: { start: () => void; stop: () => void } | null = null;
    let cleanupListeners = () => {};
    try {
      // Reduced motion: the logo shows complete (no fill movement) while the page loads.
      if (reduce) {
        fill.v = fill.target = 1;
        renderFill();
      }
      // Milestones, each worth a share of the logo. Their order is not fixed; the fill only moves forward.
      const milestones: Array<[number, Promise<unknown>]> = [
        [0.2, Promise.resolve()], // application initialised: this effect runs after hydration
        [0.2, imageReady(fillImg)], // the loader's own logo
        [0.2, document.fonts?.ready ?? Promise.resolve()], // web fonts
        [0.4, heroImagesReady()], // the hero's first-screen image for this breakpoint
      ];
      if (!reduce) {
        milestones.forEach(([weight, ready]) => {
          ready.then(() => {
            if (active && !completing) fill.target = Math.min(1, fill.target + weight);
          });
        });
        gsap.ticker.add(tick);
      }

      if (mode === "play") window.scrollTo(0, 0);
      html.classList.add("intro-lock");
      // Lenis is created by its provider after this effect, so it is read one frame later.
      cancelRaf = requestAnimationFrame(() => {
        heldLenis = lenis?.current ?? null;
        heldLenis?.stop();
      });

      // The loader covers the page, so wheel and touch must not scroll what is underneath.
      const block = (e: Event) => {
        if (active) e.preventDefault();
      };
      root.addEventListener("wheel", block, { passive: false });
      root.addEventListener("touchmove", block, { passive: false });
      const onSkip = () => complete();
      skip.addEventListener("click", onSkip);
      cleanupListeners = () => {
        root.removeEventListener("wheel", block);
        root.removeEventListener("touchmove", block);
        skip.removeEventListener("click", onSkip);
      };

      fallback = window.setTimeout(complete, timing.fallbackMs);
      Promise.all(milestones.map(([, ready]) => ready)).then(complete, complete);
    } catch {
      // Anything throws: open the site instead of trapping the visitor.
      finish();
    }

    return () => {
      // Unmount (or a development re-run): stop every callback and timer, and release the page.
      active = false;
      window.clearTimeout(fallback);
      cancelAnimationFrame(cancelRaf);
      gsap.ticker.remove(tick);
      peelTween?.kill();
      cleanupListeners();
      html.classList.remove("intro-lock");
      heldLenis?.start();
    };
  }, [lenis]);

  return (
    <div ref={rootRef} className="logo-loader fixed inset-0 z-[100] overflow-hidden">
      {/* The sticker: the red surface with the logo on it. One layer, clipped by one fold. */}
      <div data-sheet className="absolute inset-0 bg-brand">
        <div className="absolute inset-0 flex items-center justify-center pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
          <div data-logo className="relative w-[clamp(180px,54vw,220px)] md:w-[300px]" style={{ aspectRatio: ASPECT }}>
            {/* Unfilled: the whole logo as a faint white silhouette. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- optimised srcset via getImageProps, without Next's auto preload */}
            <img {...LOGO_IMG} alt="" draggable={false} className="logo-loader-ghost absolute inset-0 h-full w-full" />
            {/* Filled: the original artwork in place, revealed from the bottom edge upward. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- same image and srcset as the silhouette */}
            <img
              data-fill
              {...LOGO_IMG}
              alt=""
              draggable={false}
              fetchPriority="high"
              className="logo-loader-cut absolute inset-0 h-full w-full"
              style={{ clipPath: "inset(100% -4px -4px -4px)" }}
            />
          </div>
        </div>
        <button
          type="button"
          data-skip
          className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-10 rounded-full px-3 py-2 font-display text-xs uppercase tracking-[0.2em] text-white/90 underline-offset-4 hover:underline focus-visible:underline md:right-8"
        >
          Skip intro
        </button>
      </div>

      {/* The single curled edge: the lifted part's backside (with a curl highlight), a small contact
          shadow on the sticker and a thin crease shadow on the page being uncovered. */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient data-flap-grad id="loader-flap-grad" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d3cac8" />
            <stop offset="0.06" stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#f6f2f1" />
            <stop offset="1" stopColor="#e4dddb" />
          </linearGradient>
          <linearGradient data-crease-grad id="loader-crease-grad" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#000" stopOpacity="0.22" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path data-sheet-crease fill="url(#loader-crease-grad)" />
        <path data-sheet-flap-shadow fill="#000" fillOpacity="0.12" transform="translate(4 7)" />
        <path data-sheet-flap fill="url(#loader-flap-grad)" />
      </svg>

      <p role="status" className="sr-only">
        Loading the YEET website.
      </p>
    </div>
  );
}
