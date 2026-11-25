"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { CATEGORIES, productsIn } from "@/lib/menu";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { MenuPhoto } from "@/components/MenuPhoto";
import { SmartLink } from "@/components/SmartLink";

/**
 * "Pick your craving" as an editorial index rather than a card grid: oversized category
 * names in a ruled list, with a printed photo on desktop that follows the hovered or focused
 * row. On touch screens every row carries its own thumbnail, so nothing depends on hover.
 */
const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const SECTION_COUNT = NUMBER_WORDS[CATEGORIES.length] ?? String(CATEGORIES.length);

export function FoodCategorySection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>("[data-cat-row]", root),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.08, clearProps: "transform", scrollTrigger: { trigger: root, start: "top 75%", once: true } },
      );
      gsap.fromTo(
        root.querySelector("[data-cat-stage]"),
        { y: 60, rotation: 4, opacity: 0 },
        { y: 0, rotation: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: root, start: "top 70%", once: true } },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  const current = CATEGORIES[active];

  return (
    <section ref={ref} id="categories" data-surface="white" aria-labelledby="categories-title" className="surface-white relative overflow-x-clip pb-24 pt-14 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <h2 id="categories-title" className="font-display text-[clamp(3rem,9vw,8.5rem)] uppercase leading-[0.85] text-brand">
            Pick your
            <br />
            craving.
          </h2>
          <p className="max-w-xs font-body text-base text-ink/80">{SECTION_COUNT} sections, one promise: every bite lands loud. Tap one to jump into the menu.</p>
        </header>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <ol className="border-t-2 border-brand/15 lg:col-span-7">
            {CATEGORIES.map((cat, i) => {
              const count = productsIn(cat.id).length;
              return (
                <li key={cat.id} data-cat-row className="border-b-2 border-brand/15">
                  <SmartLink
                    href={`/menu?cat=${cat.id}`}
                    data-cursor="view"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group flex items-center gap-4 py-4 md:gap-6 md:py-5"
                  >
                    <MenuPhoto
                      image={cat.cover}
                      alt=""
                      label={cat.name}
                      icon={cat.icon}
                      ratio={1}
                      fit={0.9}
                      maxScale={0.75}
                      sizes="88px"
                      className="w-[72px] shrink-0 -rotate-3 rounded-[6px] bg-paper md:w-[88px] lg:hidden"
                    />
                    <span className="hidden w-10 font-display text-sm text-ink/70 lg:block">0{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[clamp(1.9rem,5vw,4.6rem)] uppercase leading-none text-brand transition-transform duration-300 ease-out group-hover:translate-x-2 group-focus-visible:translate-x-2">
                        {cat.name}
                      </span>
                      <span className="mt-1.5 block font-body text-sm text-ink/80">
                        {cat.blurb} <span className="text-ink/70">· {count} items</span>
                      </span>
                    </span>
                    <FoodIcon
                      name={cat.icon}
                      className="sticker-edge hidden w-14 shrink-0 scale-75 opacity-0 transition-[opacity,scale,rotate] duration-300 ease-out group-hover:rotate-12 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 md:block"
                    />
                    <span aria-hidden="true" className="font-display text-2xl text-brand transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </SmartLink>
                </li>
              );
            })}
          </ol>

          {/* Desktop: printed photo that follows the active row */}
          <div className="hidden lg:col-span-5 lg:block">
            <div data-cat-stage className="sticky top-28">
              <div className="relative -rotate-2 bg-white p-3 shadow-[0_30px_45px_-30px_rgba(0,0,0,0.55)] ring-1 ring-black/5">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {CATEGORIES.map((cat, i) => (
                    <div
                      key={cat.id}
                      aria-hidden={i !== active}
                      className={`absolute inset-0 transition-[opacity,scale] duration-500 ease-out ${i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}
                    >
                      <MenuPhoto
                        image={cat.cover}
                        alt={cat.name}
                        label={cat.name}
                        icon={cat.icon}
                        ratio={4 / 5}
                        fit={0.82}
                        maxScale={1.3}
                        className="h-full w-full bg-paper"
                        sizes="(min-width: 1024px) 380px, 0px"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between px-1 pb-1 pt-4">
                  <span className="font-display text-2xl uppercase text-brand">{current.name}</span>
                  <span className="font-body text-sm text-ink/70">{productsIn(current.id).length} items</span>
                </div>
                <FoodIcon key={current.id} name={current.icon} className="sticker-edge absolute -right-3 -top-6 w-24 rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
