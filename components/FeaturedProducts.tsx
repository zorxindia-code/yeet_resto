"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { PRODUCTS, CATEGORIES } from "@/lib/menu";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { PHOTOS } from "@/lib/assets";
import { FoodIconPattern } from "@/components/FoodIconPattern";

const FEATURED = PRODUCTS.filter((p) => p.featured);

function Heat({ level = 0 }: { level?: number }) {
  if (!level) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-display text-xs uppercase tracking-wide text-brand" aria-label={`Spicy level ${level} of 3`}>
      Spicy
      <span aria-hidden="true" className="flex gap-0.5">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-2 w-2 rounded-full ${n <= level ? "bg-brand" : "bg-brand/25"}`} />
        ))}
      </span>
    </span>
  );
}

export function FeaturedProducts() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const cards = gsap.utils.toArray<HTMLElement>("[data-product]", root);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 100, opacity: 0, rotation: (i: number) => (i % 2 ? 3 : -3) },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "transform",
          scrollTrigger: { trigger: root, start: "top 72%", once: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="featured" data-surface="red" aria-labelledby="featured-title" className="surface-red paper-texture relative overflow-hidden py-24 md:py-36">
      <FoodIconPattern tone="red" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <h2 id="featured-title" className="relative z-10 font-display text-[clamp(3.2rem,10vw,10rem)] uppercase leading-[0.84] text-white">
          Love at<br />
          <span className="inline-block -rotate-2 md:ml-[12%]">first bite.</span>
        </h2>
        <p className="mt-8 max-w-sm font-body text-white/85 md:ml-[12%]">
          Signature picks from the sample menu. Names, descriptions and prices are placeholders until real items are supplied.
        </p>

        <ul className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-12 md:gap-6">
          {FEATURED.map((p, i) => {
            const cat = CATEGORIES.find((c) => c.id === p.category);
            const layout =
              i === 0 ? "md:col-span-6" : i === 1 ? "md:col-span-4 md:col-start-8 md:mt-40" : "md:col-span-5 md:col-start-2 md:mt-10";
            return (
              <li key={p.id} data-product className={layout}>
                <article className="group relative rounded-[32px] bg-white p-4 text-ink shadow-[0_30px_40px_-30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out hover:-translate-y-2 hover:-rotate-1 md:p-5">
                  {p.bestseller ? (
                    <span
                      className="sticker-label absolute -right-3 -top-4 z-10 flex h-24 w-24 -rotate-12 items-center justify-center rounded-full bg-brand text-center text-sm text-white ring-4 ring-white md:h-28 md:w-28"
                    >
                      Best<br />seller
                    </span>
                  ) : null}
                  <div className="relative overflow-hidden rounded-[24px]">
                    <PhotoPlaceholder
                      src={PHOTOS.products[p.id]}
                      alt={p.name}
                      label={`${p.name}: realistic product photo`}
                      ratio={i === 0 ? "5 / 4" : "4 / 5"}
                      className="w-full transition-transform duration-700 group-hover:scale-[1.05]"
                      sizes="(min-width: 768px) 40vw, 90vw"
                    />
                    <FoodIcon name={p.icon} className="absolute bottom-3 left-3 w-14 text-brand drop-shadow-sm md:w-16" title={`${p.name} icon`} />
                  </div>
                  <div className="px-2 pb-2 pt-5">
                    <p className="font-display text-xs uppercase tracking-[0.2em] text-brand">{cat?.name}</p>
                    <h3 className="mt-1 font-display text-3xl uppercase leading-none text-ink md:text-4xl">{p.name}</h3>
                    <p className="mt-3 font-body text-sm text-ink/75">{p.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-paper px-3 py-1 font-display text-sm text-brand">{p.price ?? "PRICE TBA"}</span>
                      <Heat level={p.spicy} />
                      {p.dietary.map((d) => (
                        <span key={d} className="rounded-full border border-ink/15 px-3 py-1 font-body text-xs text-ink/65">{d}</span>
                      ))}
                    </div>
                    <Link href={`/menu?cat=${p.category}`} className="mt-5 inline-flex font-display text-sm uppercase tracking-wide text-brand underline-offset-4 hover:underline" data-cursor="explore">
                      See in menu →
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
