"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { CATEGORIES, PRODUCTS } from "@/lib/menu";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { PHOTOS } from "@/lib/assets";

const TILTS = [-2, 1.5, -1, 2, -1.5, 1];

export function FoodCategorySection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const cards = gsap.utils.toArray<HTMLElement>("[data-cat-card]", root);
    const ctx = gsap.context(() => {
      // Animates the <li> wrappers (no CSS transitions) with explicit end values,
      // so hover transitions on the inner link never fight GSAP's transform.
      gsap.fromTo(
        cards,
        { y: 90, opacity: 0, rotation: (i: number) => TILTS[i % TILTS.length] * 3 },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.09,
          clearProps: "transform",
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="categories" data-surface="white" aria-labelledby="categories-title" className="surface-white relative py-20 md:py-28">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <header className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <h2 id="categories-title" className="font-display text-[clamp(3rem,9vw,8.5rem)] uppercase leading-[0.85] text-brand">
            Pick your<br />craving.
          </h2>
          <p className="max-w-xs font-body text-base text-ink/75">Six sections, one sticker-sized promise: every bite lands loud.</p>
        </header>

        <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
          {CATEGORIES.map((cat, i) => {
            const count = PRODUCTS.filter((p) => p.category === cat.id).length;
            const big = i === 0;
            return (
              <li key={cat.id} data-cat-card className={big ? "col-span-2" : ""}>
                <Link
                  href={`/menu?cat=${cat.id}`}
                  data-cursor="view"
                  className="group relative block h-full rounded-[32px] bg-white p-3 pb-5 shadow-[0_18px_30px_-22px_rgba(221,3,3,0.55)] ring-1 ring-brand/10 transition-transform duration-300 ease-out hover:-translate-y-2 md:p-4"
                >
                  <div className="relative overflow-hidden rounded-[24px]">
                    <PhotoPlaceholder
                      src={PHOTOS.categories[cat.id]}
                      alt={cat.name}
                      label={`${cat.name}: realistic commercial food photo`}
                      ratio={big ? "16 / 9" : "4 / 3"}
                      className="w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      sizes="(min-width: 768px) 30vw, 48vw"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute right-0 top-0 h-16 w-16 origin-top-right scale-0 bg-white transition-transform duration-300 group-hover:scale-100"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
                    />
                    <FoodIcon
                      name={cat.icon}
                      className="sticker-edge absolute -right-1 top-2 w-16 text-brand transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:rotate-[10deg] md:w-24"
                      style={{ rotate: "6deg" }}
                    />
                    <span className="sticker-label absolute bottom-3 left-3 rounded-full bg-brand px-4 py-2 text-xs text-white opacity-100 transition-opacity duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                      View menu
                    </span>
                  </div>
                  <div className="mt-4 px-1">
                    <h3 className={`font-display uppercase leading-none text-brand ${big ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl"}`}>{cat.name}</h3>
                    <p className="mt-2 font-body text-sm text-ink/70">
                      {cat.blurb} <span className="text-ink/50">· {count} items</span>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
