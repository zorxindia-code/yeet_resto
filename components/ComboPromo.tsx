"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { FoodIconPattern } from "@/components/FoodIconPattern";
import { SmartLink } from "@/components/SmartLink";
import { PHOTOS } from "@/lib/assets";

/**
 * Phones only: a poster-style promo for the strips meals (the menu's combos), a red block with
 * the photo directly below and two stickers slapped onto its corners. Copy only states what the
 * menu lists; no promotional price.
 */
export function ComboPromo() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const root = ref.current;
    // Hidden on desktop (display: none), so skip the animation there entirely.
    if (!root || prefersReducedMotion() || !window.matchMedia("(max-width: 767px)").matches) return;
    const ctx = gsap.context(() => {
      const stickers = gsap.utils.toArray<HTMLElement>("[data-combo-sticker]", root);
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.querySelector("[data-combo-photo]"), start: "top 75%", once: true } });
      tl.fromTo(stickers, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: 0.15 }).fromTo(
        stickers,
        { scale: 1.8, rotation: (i: number) => (i % 2 ? 30 : -30) },
        { scale: 1, rotation: 0, duration: 0.5, ease: "power4.out", stagger: 0.15 },
        0,
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} data-surface="white" aria-labelledby="combo-title" className="surface-white overflow-x-clip px-4 pb-24 pt-14 md:hidden">
      <div className="surface-red relative overflow-hidden px-6 pb-8 pt-10">
        <FoodIconPattern tone="red" density="low" offset={4} />
        <div className="relative">
          <p className="font-display text-xs uppercase tracking-[0.25em] text-white">Strips meals</p>
          <h2 id="combo-title" className="mt-3 font-display text-[clamp(2.75rem,14vw,3.6rem)] uppercase leading-[0.86] text-white">
            Make it
            <br />a combo.
          </h2>
          <p className="mt-5 max-w-[30ch] font-body text-base text-white">
            Crispy chicken, fries, garlic and a bun in one order. Pick 3, 5 or 12 pieces.
          </p>
          <SmartLink
            href="/menu?cat=strips-meals"
            data-cursor="explore"
            className="mt-7 inline-flex h-12 items-center rounded-full bg-white px-6 font-display text-sm uppercase tracking-wide text-brand"
          >
            See the meals
          </SmartLink>
        </div>
      </div>

      <div data-combo-photo className="relative mt-3">
        <div className="relative aspect-[4/5] overflow-hidden bg-paper">
          <Image src={PHOTOS.mobile.combo.src} alt={PHOTOS.mobile.combo.alt} fill sizes="(min-width: 768px) 1px, 92vw" className="object-cover" />
        </div>
        <span className="absolute bottom-3 right-3 bg-white px-2 py-1 font-body text-[11px] text-ink/80">Photo TBC</span>
        <div data-combo-sticker className="absolute -right-2 -top-6 w-16" aria-hidden="true">
          <FoodIcon name="soda" className="sticker-edge h-auto w-full rotate-12" />
        </div>
        <div data-combo-sticker className="absolute -bottom-6 -left-2 w-[4.5rem]" aria-hidden="true">
          <FoodIcon name="fries" className="sticker-edge h-auto w-full -rotate-12" />
        </div>
      </div>
    </section>
  );
}
