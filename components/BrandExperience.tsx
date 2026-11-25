"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/assets";

const PRINTS = [
  { key: "room", label: "Restaurant interior, casual dining room", caption: "The room", rot: -4, mt: "md:mt-0" },
  { key: "crew", label: "Friends sharing food at a table", caption: "The crew", rot: 3, mt: "md:mt-24" },
  { key: "kitchen", label: "Close-up of food preparation in the kitchen", caption: "The kitchen", rot: -2, mt: "md:mt-10" },
] as const;

/** Editorial brand story: printed photos pinned to a wall, with paper shadows and hand-drawn accents. */
export function BrandExperience() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const prints = gsap.utils.toArray<HTMLElement>("[data-print]", root);
      // Explicit end values: each print settles at its own pinned-to-the-wall tilt.
      gsap.fromTo(
        prints,
        { y: 120, opacity: 0, rotation: (i: number) => PRINTS[i].rot + (i - 1) * 6 },
        {
          y: 0,
          opacity: 1,
          rotation: (i: number) => PRINTS[i].rot,
          duration: 1,
          ease: "power3.out",
          stagger: 0.14,
          scrollTrigger: { trigger: root, start: "top 75%", once: true },
        },
      );
      prints.forEach((el, i) => {
        if (i === 0) return;
        gsap.to(el, {
          yPercent: i === 1 ? -8 : -4,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="about" data-surface="white" aria-labelledby="about-title" className="surface-white relative overflow-hidden py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="font-display text-sm uppercase tracking-[0.25em] text-brand">About YEET</p>
            <h2 id="about-title" className="mt-3 font-display text-[clamp(3rem,9vw,8.5rem)] uppercase leading-[0.85] text-brand">
              Good food.<br />
              <span className="text-ink">Loud moods.</span>
            </h2>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="font-body text-lg text-ink">
              A loud little café for big bites, crunchy sides and good company. Come hungry, leave happy.
            </p>
            <p className="mt-3 font-body text-sm text-ink/70">Sample copy until the real YEET story is supplied.</p>
          </div>
        </div>

        {/* Phones: a swipeable row of prints instead of three full-height stacked photos. */}
        <div className="relative -mx-5 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 py-8 [scrollbar-width:none] md:mx-0 md:mt-20 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:p-0 [&::-webkit-scrollbar]:hidden">
          {PRINTS.map((print, i) => (
            <figure
              key={print.caption}
              data-print
              className={`relative w-[74%] shrink-0 snap-center bg-white p-3 pb-6 shadow-[0_24px_30px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5 md:w-auto ${print.mt}`}
              style={{ transform: `rotate(${print.rot}deg)` }}
            >
              <Photo
                src={PHOTOS.lifestyle[print.key]}
                alt={`${print.caption} at YEET`}
                label={print.label}
                ratio="4 / 5"
                className="w-full"
                sizes="(min-width: 768px) 30vw, 70vw"
              />
              <figcaption className="mt-4 flex items-center justify-between px-1">
                <span className="font-display text-2xl uppercase text-brand">{print.caption}</span>
                <span className="font-body text-xs text-ink/70">Photo TBC</span>
              </figcaption>
              {i === 0 ? (
                <FoodIcon name="star" className="sticker-edge absolute -right-3 -top-5 w-16 text-brand md:-right-8 md:-top-8 md:w-36" style={{ rotate: "12deg" }} />
              ) : null}
            </figure>
          ))}

          <svg
            aria-hidden="true"
            viewBox="0 0 220 120"
            className="pointer-events-none absolute left-[30%] top-[62%] hidden w-44 text-brand md:block"
          >
            <path d="M8 96 C70 110 130 60 186 26" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" />
            <path d="M172 16 L188 26 L176 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}
