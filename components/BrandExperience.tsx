"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
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
          <p className="font-body text-lg text-ink/80 md:col-span-4 md:col-start-9">
            Placeholder brand story: a short line about the café, the crew and the kitchen. Replace with the real YEET story.
          </p>
        </div>

        <div className="relative mt-20 grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-3 md:gap-8">
          {PRINTS.map((print, i) => (
            <figure
              key={print.caption}
              data-print
              className={`relative bg-white p-3 pb-6 shadow-[0_24px_30px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5 ${print.mt}`}
              style={{ transform: `rotate(${print.rot}deg)` }}
            >
              <PhotoPlaceholder
                src={PHOTOS.lifestyle[print.key]}
                alt={`${print.caption} at YEET`}
                label={print.label}
                ratio="4 / 5"
                className="w-full"
                sizes="(min-width: 768px) 30vw, 90vw"
              />
              <figcaption className="mt-4 flex items-center justify-between px-1">
                <span className="font-display text-2xl uppercase text-brand">{print.caption}</span>
                <span className="font-body text-xs text-ink/50">Photo TBC</span>
              </figcaption>
              {i === 0 ? (
                <FoodIcon name="burger" className="sticker-edge absolute -right-8 -top-8 w-28 text-brand md:w-36" style={{ rotate: "12deg" }} />
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
