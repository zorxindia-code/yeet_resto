"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion, isDesktopFine } from "@/lib/motion";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { FoodIconPattern } from "@/components/FoodIconPattern";
import { StickerButton } from "@/components/StickerButton";
import { SITE } from "@/lib/site";
import { PHOTOS } from "@/lib/assets";

const { burger, drumstick, fries } = PHOTOS.hero;

/**
 * Hero: oversized type on the left; on the right an open, art-directed product composition
 * (transparent burger, drumstick and fries photography, outlined type, stickers, a hand-drawn
 * callout). Each element has up to three wrapper layers so motions never fight:
 *   [data-depth]  → mouse parallax (x/y) and scroll exit (xPercent/yPercent)
 *   hover layer   → CSS-only hover transforms
 *   [data-enter]  → GSAP entrance (y, rotation, scale, opacity)
 * With motion disabled the composition renders in its final, static state.
 */
export function HeroSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root) return;
    const reduce = prefersReducedMotion();
    const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, root);

    const ctx = gsap.context(() => {
      if (reduce) return;
      const intro = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      intro
        .fromTo(q("[data-word]"), { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.08 })
        .fromTo(q("[data-enter='type']"), { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.2 }, 0)
        .fromTo(q("[data-enter='shadow']"), { opacity: 0, scaleX: 0.5 }, { opacity: 1, scaleX: 1, duration: 1 }, 0.15)
        // Transform only: the burger is the LCP image, so it is never hidden with opacity.
        .fromTo(
          q("[data-enter='burger']"),
          { y: 160, rotation: -12, scale: 0.86 },
          { y: 0, rotation: 0, scale: 1, duration: 1.15, ease: "power4.out" },
          0.1,
        )
        .fromTo(q("[data-enter='fries']"), { x: 120, y: 70, rotation: 24, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1 }, 0.3)
        .fromTo(q("[data-enter='chicken']"), { x: -150, y: 90, rotation: -40, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1 }, 0.38)
        // Stickers switch on instantly (never half-transparent text), then slap down.
        .fromTo(q("[data-enter='sticker']"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, stagger: 0.12 }, 0.75)
        .fromTo(
          q("[data-enter='sticker']"),
          { scale: 1.8, rotation: (i: number) => (i % 2 ? 28 : -28) },
          { scale: 1, rotation: 0, duration: 0.5, ease: "power4.out", stagger: 0.12 },
          0.75,
        )
        .fromTo(q("[data-enter='arrow'] path"), { strokeDashoffset: 260 }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, 1.05)
        .fromTo(q("[data-enter='note']"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 1.2)
        .fromTo(q("[data-enter='note']"), { y: 10 }, { y: 0, duration: 0.4 }, 1.2)
        .fromTo(q("[data-hero-cta]"), { y: 24, scale: 0.94 }, { y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.6)" }, 0.85);

      if (document.documentElement.dataset.intro === "play") {
        window.addEventListener("yeet:intro-done", () => intro.play(), { once: true });
      } else {
        intro.play();
      }

      // A couple of small packaging icons drift gently, only while the hero is on screen.
      const float = gsap.to(q("[data-float]"), {
        y: -10,
        rotation: "+=4",
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.7,
        paused: true,
      });
      ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onToggle: (self) => (self.isActive ? float.play() : float.pause()) });

      // Scroll exit: products part ways as the next section slides over.
      const exit = { trigger: root, start: "top top", end: "bottom top", scrub: true } as const;
      gsap.to(q("[data-exit='burger']"), { yPercent: -16, ease: "none", scrollTrigger: exit });
      gsap.to(q("[data-exit='fries']"), { xPercent: 22, yPercent: -10, ease: "none", scrollTrigger: exit });
      gsap.to(q("[data-exit='chicken']"), { xPercent: -24, yPercent: -4, ease: "none", scrollTrigger: exit });
      gsap.to(q("[data-exit='type']"), { yPercent: 24, ease: "none", scrollTrigger: exit });
      gsap.to(q("[data-hero-copy]"), { yPercent: -10, opacity: 0.25, ease: "none", scrollTrigger: exit });
      gsap.to(q("[data-hero-pattern]"), { yPercent: -10, ease: "none", scrollTrigger: exit });
    }, root);

    // Desktop-only, minimal mouse parallax on the composition layers.
    let onMove: ((e: PointerEvent) => void) | null = null;
    if (!reduce && isDesktopFine()) {
      const layers = q<HTMLElement>("[data-depth]");
      const setters = layers.map((el) => ({
        depth: Number(el.dataset.depth),
        x: gsap.quickTo(el, "x", { duration: 1, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 1, ease: "power3.out" }),
      }));
      onMove = (e: PointerEvent) => {
        const r = root.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        setters.forEach((s) => {
          s.x(nx * s.depth);
          s.y(ny * s.depth);
        });
      };
      root.addEventListener("pointermove", onMove, { passive: true });
    }

    return () => {
      if (onMove) root.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={ref}
      data-surface="red"
      aria-labelledby="hero-title"
      className="surface-red paper-texture relative isolate min-h-[100svh] overflow-hidden pb-24 pt-28 md:pt-32"
    >
      <div data-hero-pattern className="absolute inset-0 -z-10">
        <FoodIconPattern tone="red" density="low" />
      </div>

      <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] items-center gap-6 px-5 md:px-10 lg:min-h-[calc(100svh-10rem)] lg:grid-cols-12">
        <div data-hero-copy className="relative z-10 lg:col-span-5">
          <p className="sticker-label inline-block -rotate-2 bg-white px-4 py-2 text-sm text-brand [border-radius:14px_6px_12px_8px]">
            Stick it. Peel it. YEET it.
          </p>
          <h1
            id="hero-title"
            className="mt-6 font-display font-semibold uppercase leading-[0.84] text-white"
            style={{ fontSize: "clamp(3.4rem, 7vw, 6.4rem)" }}
          >
            <span className="block overflow-hidden pb-1">
              <span data-word className="inline-block whitespace-nowrap">Cravings?</span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span data-word className="inline-block -rotate-2 whitespace-nowrap">YEET it.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-md font-body text-lg text-white md:text-xl">{SITE.tagline}</p>

          <div className="mt-9 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <span data-hero-cta className="block sm:inline-block">
              <StickerButton href="/menu" surface="red" className="w-full sm:w-auto">Explore the menu</StickerButton>
            </span>
            <span data-hero-cta className="block sm:inline-block">
              <StickerButton href={SITE.orderUrl} variant="secondary" surface="red" className="w-full sm:w-auto">Order now</StickerButton>
            </span>
          </div>
        </div>

        {/* Product composition: an open, layered layout rather than a framed card */}
        <div className="relative lg:col-span-7">
          <div className="@container relative mx-auto aspect-[1/0.9] w-full max-w-[720px] lg:-mr-6 lg:ml-auto">
            {/* Outlined type for depth */}
            <div data-depth="8" className="absolute -left-[4%] top-[2%] z-0" aria-hidden="true">
              <div data-exit="type">
                <span
                  data-enter="type"
                  className="block -rotate-6 font-display text-[34cqw] font-bold uppercase leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.55)]"
                >
                  Yeet
                </span>
              </div>
            </div>

            {/* Fries, tucked behind the burger */}
            <div data-depth="16" className="absolute bottom-[17%] right-[1%] z-[1] w-[37%]">
              <div data-exit="fries">
                <div data-enter="fries">
                  <Image
                    src={fries.src}
                    alt={fries.alt}
                    width={fries.width}
                    height={fries.height}
                    sizes="(min-width: 1024px) 270px, 37vw"
                    className="h-auto w-full rotate-[8deg]"
                  />
                </div>
              </div>
            </div>

            {/* Contact shadow */}
            <div
              aria-hidden="true"
              data-enter="shadow"
              className="absolute bottom-[9%] left-[10%] z-[1] h-[10%] w-[72%]"
              style={{ background: "radial-gradient(closest-side, rgba(70,0,0,0.55), rgba(70,0,0,0))" }}
            />

            {/* Signature burger: the focal point and LCP image */}
            <div data-depth="10" className="absolute bottom-[11%] left-[5%] z-[2] w-[80%]">
              <div data-exit="burger">
                <div className="transition-[rotate,scale] duration-500 ease-out hover:rotate-2 hover:scale-[1.03]" data-cursor="BITE ME">
                  <div data-enter="burger">
                    <Image
                      src={burger.src}
                      alt={burger.alt}
                      width={burger.width}
                      height={burger.height}
                      loading="eager"
                      fetchPriority="high"
                      sizes="(min-width: 1024px) 580px, 80vw"
                      className="h-auto w-full -rotate-3"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Crispy chicken in front */}
            <div data-depth="22" className="absolute -left-[6%] bottom-[1%] z-[3] w-[46%]">
              <div data-exit="chicken">
                <div data-enter="chicken">
                  <Image
                    src={drumstick.src}
                    alt={drumstick.alt}
                    width={drumstick.width}
                    height={drumstick.height}
                    sizes="(min-width: 1024px) 330px, 46vw"
                    className="h-auto w-full -rotate-[14deg]"
                  />
                </div>
              </div>
            </div>

            {/* Stickers */}
            <div data-depth="18" className="absolute right-[0%] top-[4%] z-[4] w-[32%]">
              <div data-enter="sticker">
                <Image src="/brand/yeet-logo.png" alt="" width={1080} height={579} sizes="230px" className="logo-die-cut h-auto w-full rotate-[8deg]" />
              </div>
            </div>
            <div data-depth="14" className="absolute bottom-[40%] right-[3%] z-[4] hidden sm:block">
              <div data-enter="sticker">
                <span className="sticker-label die-cut inline-block -rotate-6 bg-white px-4 py-2 text-[clamp(0.9rem,2.2cqw,1.25rem)] text-brand">
                  Big bite!
                </span>
              </div>
            </div>

            {/* Hand-drawn callout */}
            <div className="absolute left-[30%] top-[6%] z-[4] w-[34%]" aria-hidden="true">
              <p data-enter="note" className="-rotate-6 font-display text-[clamp(0.85rem,2.4cqw,1.35rem)] uppercase leading-tight text-white">
                Extra cheese,
                <br />
                zero regrets
              </p>
              <svg data-enter="arrow" viewBox="0 0 160 110" className="ml-[10%] mt-1 w-[70%] overflow-visible text-white">
                <path d="M10 6 C 40 40, 70 50, 118 86" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="260" />
                <path d="M100 90 L120 88 L116 68" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="260" />
              </svg>
            </div>

            {/* Packaging-icon accents */}
            <div data-float className="absolute left-[2%] top-[38%] z-[1] w-[11%]" aria-hidden="true">
              <FoodIcon name="juice" className="sticker-edge h-auto w-full -rotate-12" />
            </div>
            <div data-float className="absolute right-[34%] top-[0%] z-[1] hidden w-[9%] sm:block" aria-hidden="true">
              <FoodIcon name="popcorn" className="sticker-edge h-auto w-full rotate-12" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-[1440px] items-center gap-3 px-5 font-display text-sm uppercase tracking-[0.2em] text-white md:px-10">
        <span aria-hidden="true" className="h-px w-10 bg-white" />
        Scroll to peel
      </div>
    </section>
  );
}
