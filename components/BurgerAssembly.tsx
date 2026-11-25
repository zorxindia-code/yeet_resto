"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { BURGER_LAYERS, BURGER_VIEW } from "@/components/illustrations/BurgerLayers";

const { top: VIEW_TOP, height: VIEW_H, width: VIEW_W } = BURGER_VIEW;
const LABEL_X = 432; // drawing units, just right of the stage
// Labels are evenly spaced (bottom bun lowest) so they never collide; leader lines connect
// each label to its ingredient's real edge.
const labelY = (i: number) => 380 - i * 40;
const EXPLODE = 36; // vertical gap between exploded layers, drawing units

/**
 * Desktop (≥1024px): pinned, scrubbed sequence synced to Lenis through ScrollTrigger.
 * Layers start exploded along the burger axis and settle bottom-up; labels and leader lines
 * stick on as each lands; the YEET sticker slaps on last. Scrolling up reverses it exactly.
 * Mobile / reduced motion: the assembled burger renders statically with an ingredient list.
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
      const arts = gsap.utils.toArray<SVGGElement>("[data-layer]", stage);
      const halos = gsap.utils.toArray<SVGGElement>("[data-halo]", stage);
      const labels = gsap.utils.toArray<HTMLElement>("[data-layer-label]", stage);
      const leaders = gsap.utils.toArray<SVGGElement>("[data-leader]", stage);
      const copy = gsap.utils.toArray<HTMLElement>("[data-stage-copy]", section);
      const shadow = stage.querySelector("[data-ground]");
      const sticker = stage.querySelector("[data-yeet-sticker]");
      const mid = (arts.length - 1) / 2;
      const pair = (i: number) => [halos[i], arts[i]];

      // Exploded composition: separated vertically along the shared axis, slight alternating tilt.
      arts.forEach((_, i) => {
        gsap.set(pair(i), { y: (i - mid) * -EXPLODE, x: i % 2 ? 18 : -18, rotation: i % 2 ? 4 : -4, svgOrigin: "200 220" });
      });
      gsap.set([...labels, ...leaders], { opacity: 0 });
      gsap.set(copy.slice(1), { opacity: 0 });
      if (shadow) gsap.set(shadow, { opacity: 0, scaleX: 0.5, svgOrigin: "200 390" });
      if (sticker) gsap.set(sticker, { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: { trigger: section, start: "top top", end: "+=160%", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true },
      });
      // 1–2: ingredients descend into place, bottom-up.
      arts.forEach((_, i) => tl.to(pair(i), { y: 0, x: 0, rotation: 0, duration: 1 }, i * 0.14));
      // 3: labels and leader lines attach as each layer lands.
      arts.forEach((_, i) => tl.fromTo([labels[i], leaders[i]], { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }, 0.75 + i * 0.14));
      if (shadow) tl.to(shadow, { opacity: 1, scaleX: 1, duration: 0.8 }, 1.0);
      // 4: copy follows the stage.
      tl.to(copy[0], { opacity: 0, duration: 0.25 }, 0.9).to(copy[1], { opacity: 1, duration: 0.25 }, 1.0);
      tl.to(copy[1], { opacity: 0, duration: 0.25 }, 1.9).to(copy[2], { opacity: 1, duration: 0.25 }, 2.0);
      // 5: the YEET sticker slaps onto the finished burger.
      if (sticker) {
        tl.fromTo(sticker, { opacity: 0, scale: 1.8, rotation: -24 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.4, ease: "power4.out" }, 2.1);
      }
      tl.to({}, { duration: 0.4 });
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
            Built for
            <br />
            the bite.
          </h2>
          <div className="relative mt-8 font-body text-lg text-white md:text-xl lg:min-h-[8rem]">
            <p data-stage-copy className="max-w-md lg:absolute lg:inset-x-0 lg:top-0">
              Eight layers, one axis. Scroll and watch every ingredient drop into place.
            </p>
            {/* Supplementary captions: start transparent, revealed only by the scroll timeline */}
            <p data-stage-copy aria-hidden="true" className="hidden max-w-md opacity-0 lg:absolute lg:inset-x-0 lg:top-0 lg:block">
              Cheese melts over the patty, tomato and onion stack up, the sesame bun lands last.
            </p>
            <p data-stage-copy aria-hidden="true" className="hidden max-w-md font-display text-3xl uppercase opacity-0 lg:absolute lg:inset-x-0 lg:top-0 lg:block">
              Stacked. Sauced. YEET&apos;d.
            </p>
          </div>
          <p className="mt-6 font-body text-sm text-white">Illustrated build. The ingredient list is a sample until the real recipe is supplied.</p>
        </div>

        <div className="lg:col-span-7">
          <div ref={stageRef} className="relative mx-auto w-full max-w-[400px] lg:ml-[4%] lg:mr-0 lg:w-[min(440px,50svh)] lg:max-w-none">
            <svg
              viewBox={`0 ${VIEW_TOP} ${VIEW_W} ${VIEW_H}`}
              className="block h-auto w-full overflow-visible"
              role="img"
              aria-label="Illustrated burger, top to bottom: sesame bun, lettuce, tomato, red onion, cheddar, beef patty, lettuce, toasted bun"
            >
              <ellipse data-ground cx="200" cy="390" rx="150" ry="9" fill="#5a0000" opacity="0.35" />
              {/* White die-cut halos sit behind all the art: separate outlines when exploded,
                  one continuous sticker outline once assembled. */}
              <g>
                {BURGER_LAYERS.map((layer) => (
                  <g key={layer.key} data-halo className="layer-halo">
                    {layer.art}
                  </g>
                ))}
              </g>
              <g>
                {BURGER_LAYERS.map((layer) => (
                  <g key={layer.key} data-layer>
                    {layer.art}
                  </g>
                ))}
              </g>
              {/* Leader lines (desktop) */}
              <g className="hidden lg:inline" aria-hidden="true">
                {BURGER_LAYERS.map((layer, i) => {
                  const [ax, ay] = layer.anchor;
                  const ly = labelY(i);
                  return (
                    <g key={layer.key} data-leader>
                      <polyline points={`${ax},${ay} ${LABEL_X - 22},${ly} ${LABEL_X - 4},${ly}`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx={ax} cy={ay} r="4" fill="#fff" />
                    </g>
                  );
                })}
              </g>
            </svg>

            {BURGER_LAYERS.map((layer, i) => (
              <span
                key={layer.key}
                data-layer-label
                aria-hidden="true"
                className="sticker-label absolute hidden -translate-y-1/2 whitespace-nowrap bg-white px-3 py-1 text-xs text-brand [border-radius:10px_4px_9px_5px] lg:block"
                style={{ left: `${(LABEL_X / VIEW_W) * 100}%`, top: `${((labelY(i) - VIEW_TOP) / VIEW_H) * 100}%` }}
              >
                {layer.label}
              </span>
            ))}

            <div data-yeet-sticker className="absolute -top-[10%] left-0 z-10 w-[30%] -rotate-[8deg] lg:-left-[12%] lg:w-[34%]">
              <Image src="/brand/yeet-logo.png" alt="" width={1080} height={579} sizes="160px" className="logo-die-cut h-auto w-full" />
            </div>
          </div>

          {/* Mobile: the ingredient list as plain editorial text */}
          <p className="mx-auto mt-10 max-w-md text-center font-display text-sm uppercase leading-relaxed tracking-wide text-white lg:hidden">
            {[...BURGER_LAYERS].reverse().map((l, i, arr) => (
              <span key={l.key}>
                {l.label}
                {i < arr.length - 1 ? <span aria-hidden="true"> · </span> : null}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
