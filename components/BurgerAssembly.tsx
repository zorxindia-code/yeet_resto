"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";

const R = "#DD0303";
const VIEW_TOP = 90;
const VIEW_H = 310;

type Layer = { key: string; label: string; art: ReactNode };

// Bottom → top. Stylised placeholders for real transparent ingredient photos (same keys/positions can
// be reused when individual ingredient PNG/WebP assets are supplied).
const LAYERS: Layer[] = [
  {
    key: "bottom-bun",
    label: "Bottom bun",
    art: <path d="M40 330 H360 Q360 384 308 384 H92 Q40 384 40 330 Z" fill="#fff" stroke={R} strokeWidth="6" />,
  },
  {
    key: "sauce",
    label: "YEET sauce",
    art: <path d="M44 318 H356 Q360 330 346 330 Q336 346 326 330 H226 Q216 346 206 330 H110 Q100 344 90 330 H54 Q40 330 44 318 Z" fill={R} />,
  },
  {
    key: "lettuce",
    label: "Crisp lettuce",
    art: (
      <path
        d="M30 304 Q46 284 62 304 T94 304 T126 304 T158 304 T190 304 T222 304 T254 304 T286 304 T318 304 T350 304 T370 304 L366 318 H34 Z"
        fill="#fff"
        stroke={R}
        strokeWidth="5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    key: "patty",
    label: "Crispy patty",
    art: (
      <>
        <rect x="40" y="252" width="320" height="42" rx="21" fill={R} />
        <path d="M96 273 h34 M182 273 h34 M268 273 h34" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "cheese",
    label: "Melted cheese",
    art: (
      <path
        d="M32 236 H368 L358 254 H306 L296 272 L286 254 H130 L120 270 L110 254 H42 Z"
        fill="#fff"
        stroke={R}
        strokeWidth="5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    key: "pickles",
    label: "Pickles",
    art: (
      <>
        {[110, 160, 210, 260, 304].map((x) => (
          <circle key={x} cx={x} cy="226" r="10" fill={R} stroke="#fff" strokeWidth="3" />
        ))}
      </>
    ),
  },
  {
    key: "top-bun",
    label: "Top bun",
    art: (
      <>
        <path d="M40 222 C40 140 118 108 200 108 C282 108 360 140 360 222 Z" fill="#fff" stroke={R} strokeWidth="6" />
        <path d="M86 180 Q98 142 140 128" fill="none" stroke={R} strokeWidth="4" strokeLinecap="round" />
        {[
          [152, 152],
          [200, 136],
          [250, 152],
          [176, 184],
          [228, 184],
        ].map(([x, y]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="7" ry="4" fill={R} />
        ))}
      </>
    ),
  },
];

/**
 * Desktop: pinned, scrubbed sequence. Layers start exploded and settle into the stack
 * as you scroll (and reverse on the way back up). Mobile / reduced motion: the finished
 * burger renders statically, with no pin.
 */
export function BurgerAssembly() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const layers = gsap.utils.toArray<SVGGElement>("[data-layer]", stage);
      const labels = gsap.utils.toArray<HTMLElement>("[data-layer-label]", stage);
      const copy = gsap.utils.toArray<HTMLElement>("[data-stage-copy]", section);
      const sticker = stage.querySelector<HTMLElement>("[data-big-bite]");
      const mid = (layers.length - 1) / 2;

      // Exploded composition: spread vertically around the centre, alternating sideways.
      layers.forEach((el, i) => {
        gsap.set(el, {
          y: (i - mid) * -46,
          x: i % 2 ? 34 : -34,
          rotation: i % 2 ? 7 : -7,
          transformOrigin: "50% 50%",
        });
      });
      gsap.set(labels, { opacity: 0 });
      gsap.set(copy.slice(1), { opacity: 0 });
      if (sticker) gsap.set(sticker, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Ingredients descend and settle, bottom layer first.
      layers.forEach((el, i) => {
        tl.to(el, { y: 0, x: 0, rotation: 0, duration: 1, ease: "power2.inOut" }, i * 0.12);
      });
      // Labels stick on as each layer lands.
      labels.forEach((el, i) => {
        tl.fromTo(el, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.35 }, 0.6 + i * 0.12);
      });
      // Typography follows the stage.
      tl.to(copy[0], { opacity: 0, duration: 0.25 }, 0.9).to(copy[1], { opacity: 1, duration: 0.25 }, 1.0);
      tl.to(copy[1], { opacity: 0, duration: 0.25 }, 1.8).to(copy[2], { opacity: 1, duration: 0.25 }, 1.9);
      // The finished burger gets its sticker.
      if (sticker) {
        tl.fromTo(
          sticker,
          { opacity: 0, scale: 1.8, rotation: -22 },
          { opacity: 1, scale: 1, rotation: -8, duration: 0.45, ease: "power4.out" },
          2.0,
        );
      }
      tl.to({}, { duration: 0.5 });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="assembly"
      data-surface="red"
      aria-labelledby="assembly-title"
      className="surface-red paper-texture relative overflow-hidden lg:h-[100svh]"
    >
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 py-20 md:px-10 lg:grid-cols-12 lg:py-0">
        <div className="lg:col-span-5">
          <h2 id="assembly-title" className="font-display text-[clamp(3rem,8vw,7.5rem)] uppercase leading-[0.85] text-white">
            Built for<br />the bite.
          </h2>
          <div className="relative mt-8 min-h-[8rem] font-body text-lg text-white/90 md:text-xl">
            <p data-stage-copy className="max-w-md lg:absolute lg:inset-x-0 lg:top-0">
              Ingredients drop in, one at a time. Placeholder copy: replace with the real build story.
            </p>
            {/* Supplementary stage captions: start transparent, revealed only by the scroll timeline */}
            <p data-stage-copy aria-hidden="true" className="hidden max-w-md opacity-0 lg:absolute lg:inset-x-0 lg:top-0 lg:block">
              Every layer settles where it belongs. Crisp, sauced, stacked.
            </p>
            <p data-stage-copy aria-hidden="true" className="hidden max-w-md font-display text-3xl uppercase opacity-0 lg:absolute lg:inset-x-0 lg:top-0 lg:block">
              Your move. Big bite.
            </p>
          </div>
          <p className="mt-6 font-body text-xs text-white/70">Ingredient layers and labels are placeholder illustrations.</p>
        </div>

        <div className="lg:col-span-7">
          <div ref={stageRef} className="relative mx-auto w-full max-w-[480px] lg:ml-[6%] lg:mr-0">
            <svg
              viewBox={`0 ${VIEW_TOP} 400 ${VIEW_H}`}
              className="block h-auto w-full overflow-visible"
              role="img"
              aria-label="Illustrated burger: bottom bun, sauce, lettuce, patty, cheese, pickles and top bun"
            >
              {LAYERS.map((layer) => (
                <g key={layer.key} data-layer>
                  <g className="layer-halo">{layer.art}</g>
                  {layer.art}
                </g>
              ))}
            </svg>

            {LAYERS.map((layer, i) => (
              <span
                key={layer.key}
                data-layer-label
                aria-hidden="true"
                className="sticker-label absolute left-full ml-4 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs text-brand shadow-md lg:block"
                // Evenly spaced from top bun (8%) to bottom bun (92%) so labels never collide.
                style={{ top: `${8 + ((LAYERS.length - 1 - i) / (LAYERS.length - 1)) * 84}%` }}
              >
                {String(i + 1).padStart(2, "0")} · {layer.label}
              </span>
            ))}

            <div
              data-big-bite
              className="sticker-label absolute -left-2 -top-10 z-10 flex h-24 w-24 -rotate-6 items-center justify-center rounded-full bg-white text-center text-sm text-brand ring-4 ring-brand md:h-32 md:w-32 md:text-base"
            >
              Big<br />bite!
            </div>
          </div>

          <ol className="mt-10 flex flex-wrap justify-center gap-2 lg:hidden" aria-label="Ingredients, top to bottom">
            {[...LAYERS].reverse().map((l) => (
              <li key={l.key} className="sticker-label rounded-full bg-white px-3 py-1.5 text-xs text-brand">
                {l.label}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
