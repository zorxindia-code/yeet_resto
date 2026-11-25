"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion, isDesktopFine } from "@/lib/motion";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { FoodIconPattern } from "@/components/FoodIconPattern";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { StickerButton } from "@/components/StickerButton";
import { SITE } from "@/lib/site";
import { PHOTOS } from "@/lib/assets";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root) return;
    const reduce = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>("[data-word]", root);
      const burger = root.querySelector<HTMLElement>("[data-hero-burger]");
      const stickers = gsap.utils.toArray<HTMLElement>("[data-hero-sticker]", root);
      const ctas = gsap.utils.toArray<HTMLElement>("[data-hero-cta]", root);
      const pattern = root.querySelector<HTMLElement>("[data-hero-pattern]");

      const intro = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      intro
        .fromTo(words, { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.08 })
        .fromTo(burger, { y: 120, opacity: 0, rotate: -6, scale: 0.92 }, { y: 0, opacity: 1, rotate: 0, scale: 1, duration: 1.1, ease: "power4.out" }, 0.1)
        .fromTo(
          stickers,
          { scale: 0.2, rotate: -60, opacity: 0 },
          { scale: 1, rotate: (i: number) => (i % 2 ? 9 : -7), opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.4)" },
          0.5,
        )
        .fromTo(ctas, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.6)" }, 0.9);

      if (reduce) {
        intro.progress(1);
      } else if (document.documentElement.dataset.intro === "play") {
        window.addEventListener("yeet:intro-done", () => intro.play(), { once: true });
      } else {
        intro.play();
      }

      if (pattern && !reduce) {
        gsap.to(pattern, {
          yPercent: -10,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
      }

      // Scroll hand-off: the hero recedes slightly as the next section arrives.
      if (!reduce) {
        gsap.to(root.querySelector("[data-hero-copy]"), {
          yPercent: -12,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
      }
    }, root);

    // Desktop-only subtle mouse parallax on the stickers (never the whole composition).
    let onMove: ((e: PointerEvent) => void) | null = null;
    if (!reduce && isDesktopFine()) {
      const depths = [14, 22, 10, 18];
      const els = gsap.utils.toArray<HTMLElement>("[data-hero-sticker]", root);
      const setX = els.map((el) => gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }));
      const setY = els.map((el) => gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }));
      onMove = (e: PointerEvent) => {
        const r = root.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        els.forEach((_, i) => {
          setX[i]((nx * depths[i % depths.length]) * 2);
          setY[i]((ny * depths[i % depths.length]) * 2);
        });
      };
      root.addEventListener("pointermove", onMove, { passive: true });
    }

    return () => {
      if (onMove) root.removeEventListener("pointermove", onMove);
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.trigger === root && st.kill());
    };
  }, []);

  return (
    <section
      ref={ref}
      data-surface="red"
      aria-labelledby="hero-title"
      className="surface-red paper-texture relative isolate min-h-[100svh] overflow-hidden pb-16 pt-28 md:pt-32"
    >
      <div data-hero-pattern className="absolute inset-0 -z-10">
        <FoodIconPattern tone="red" density="medium" />
      </div>

      <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1440px] items-center gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-6 lg:min-h-[calc(100svh-9rem)]">
        <div data-hero-copy className="lg:col-span-6 lg:pr-8">
          <p className="sticker-label mb-5 inline-block rounded-full bg-white px-4 py-2 text-sm text-brand">
            Stick it. Peel it. YEET it.
          </p>
          <h1 id="hero-title" className="font-display font-semibold uppercase leading-[0.84] text-white" style={{ fontSize: "clamp(3.6rem, 8.2vw, 7.4rem)" }}>
            <span className="block overflow-hidden pb-1">
              <span data-word className="inline-block whitespace-nowrap">Cravings?</span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span data-word className="inline-block whitespace-nowrap -rotate-2">YEET it.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-md font-body text-lg text-white/90 md:text-xl">{SITE.tagline}</p>

          <div className="mt-9 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <span data-hero-cta className="block sm:inline-block">
              <StickerButton href="/menu" surface="red" className="w-full sm:w-auto">Explore the menu</StickerButton>
            </span>
            <span data-hero-cta className="block sm:inline-block">
              <StickerButton href={SITE.orderUrl} variant="secondary" surface="red" className="w-full sm:w-auto">Order now</StickerButton>
            </span>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div data-hero-burger className="relative mx-auto w-[min(100%,560px)]">
            <PhotoPlaceholder
              src={PHOTOS.heroBurger}
              alt="YEET signature burger"
              label="Hero burger: realistic commercial shot, bun texture, melted cheese, crispy chicken, fresh toppings"
              ratio="1 / 1"
              priority
              sizes="(min-width: 1024px) 560px, 90vw"
              className="die-cut rotate-[-2deg]"
            />
          </div>

          <div data-hero-sticker className="absolute -left-2 top-[4%] w-24 md:w-32">
            <FoodIcon name="fries" className="sticker-edge h-auto w-full text-brand" />
          </div>
          <div data-hero-sticker className="absolute -bottom-2 left-[6%] w-24 md:w-32">
            <FoodIcon name="drumstick" className="sticker-edge h-auto w-full text-brand" />
          </div>
          <div data-hero-sticker className="absolute right-0 top-[-2%] w-20 md:w-28">
            <FoodIcon name="popcorn" className="sticker-edge h-auto w-full text-brand" />
          </div>
          <div data-hero-sticker className="absolute -right-3 bottom-[8%] w-36 md:w-52">
            <Image src="/brand/yeet-logo.png" alt="" width={1080} height={579} className="logo-die-cut h-auto w-full" />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-[1440px] items-center gap-3 px-5 font-display text-sm uppercase tracking-[0.2em] text-white/80 md:px-10">
        <span aria-hidden="true" className="h-px w-10 bg-white/70" />
        Scroll to peel
      </div>
    </section>
  );
}
