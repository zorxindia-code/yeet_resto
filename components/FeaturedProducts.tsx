"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { FEATURED, categoryById, formatPrice } from "@/lib/menu";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { Photo } from "@/components/Photo";
import { SmartLink } from "@/components/SmartLink";
import { SpiceMeter } from "@/components/SpiceMeter";
import { FoodIconPattern } from "@/components/FoodIconPattern";

/**
 * "Love at first bite": a vertical editorial list. Each featured product is one row
 * (photo + text) whose sides alternate on desktop and stack photo-first on mobile.
 * The layout is driven entirely by the data, so any number of featured items stays aligned.
 */
export function FeaturedProducts() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-feature]", root).forEach((row) => {
        const photo = row.querySelector("[data-feature-photo]");
        const text = row.querySelector("[data-feature-text]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 78%", once: true } });
        tl.fromTo(photo, { y: 80, opacity: 0, rotation: -4 }, { y: 0, opacity: 1, rotation: 0, duration: 0.9, ease: "power3.out", clearProps: "transform" })
          .fromTo(text, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", clearProps: "transform" }, 0.15);
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="featured" data-surface="red" aria-labelledby="featured-title" className="surface-red paper-texture relative overflow-hidden py-24 md:py-32">
      <FoodIconPattern tone="red" />
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        <header className="max-w-3xl">
          <h2 id="featured-title" className="font-display text-[clamp(3.2rem,9vw,8.5rem)] uppercase leading-[0.84] text-white">
            Love at
            <br />
            <span className="inline-block -rotate-2">first bite.</span>
          </h2>
          <p className="mt-6 max-w-md font-body text-lg text-white">
            Three signature picks from our demo menu. Names, prices and descriptions are samples until the real menu lands.
          </p>
        </header>

        <ol className="mt-16 flex flex-col gap-20 md:mt-24 md:gap-28">
          {FEATURED.map((p, i) => {
            const flip = i % 2 === 1;
            const category = categoryById(p.category);
            return (
              <li key={p.id} data-feature className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 md:grid-cols-12 md:gap-10">
                {/* Photo, presented as a printed shot with a white border */}
                <div data-feature-photo className={`md:col-span-7 ${flip ? "md:order-2" : ""}`}>
                  <div className={`group relative bg-white p-2 shadow-[0_30px_40px_-28px_rgba(0,0,0,0.6)] md:p-3 ${flip ? "md:rotate-[1.5deg]" : "md:-rotate-[1.5deg]"}`}>
                    <Photo
                      src={p.image}
                      alt={p.name}
                      ratio="5 / 4"
                      sizes="(min-width: 1280px) 700px, (min-width: 768px) 56vw, 92vw"
                      imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    {p.bestseller ? (
                      <span className="sticker-label die-cut absolute left-5 top-5 -rotate-6 bg-brand px-3 py-1.5 text-sm text-white md:left-7 md:top-7 md:text-base">
                        Bestseller
                      </span>
                    ) : null}
                    <FoodIcon name={p.icon} className="sticker-edge absolute bottom-4 right-4 w-14 md:bottom-6 md:right-6 md:w-20" />
                  </div>
                </div>

                {/* Text */}
                <div data-feature-text className={`relative md:col-span-5 ${flip ? "md:order-1" : ""}`}>
                  <span aria-hidden="true" className="block font-display text-[5rem] leading-[0.8] text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.6)] md:text-[7rem]">
                    0{i + 1}
                  </span>
                  <p className="mt-4 font-display text-sm uppercase tracking-[0.25em] text-white">{category.name}</p>
                  <h3 className="mt-3 font-display text-[clamp(2.4rem,4.6vw,4rem)] uppercase leading-[0.9] text-white">{p.name}</h3>
                  <p className="mt-4 max-w-sm font-body text-lg text-white">{p.description}</p>
                  <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-display text-lg uppercase text-white">
                    <span className="text-3xl">{formatPrice(p.price)}</span>
                    <SpiceMeter level={p.spicy} tone="white" />
                  </p>
                  <SmartLink
                    href={`/menu?cat=${p.category}`}
                    data-cursor="explore"
                    className="mt-8 inline-flex items-center gap-2 border-b-2 border-white pb-1 font-display text-lg uppercase text-white transition-[gap] duration-300 hover:gap-4"
                  >
                    See it on the menu <span aria-hidden="true">→</span>
                  </SmartLink>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
