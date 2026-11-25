"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { FoodIcon, type FoodIconName } from "@/components/icons/FoodIcons";
import { StickerButton } from "@/components/StickerButton";
import { SITE } from "@/lib/site";

type Placed = { icon: FoodIconName; label: string; left: string; width: string; rot: number };

// Rise out of the bag. Positioned relative to the bag; bottoms stay tucked behind the front panel.
const EMERGE: (Placed & { bottom: string })[] = [
  { icon: "burger-box", label: "Burger box", left: "0%", width: "44%", bottom: "70%", rot: -9 },
  { icon: "soda", label: "Soft drink cup", left: "62%", width: "30%", bottom: "72%", rot: 8 },
  { icon: "fries", label: "Fries carton", left: "31%", width: "36%", bottom: "69%", rot: 3 },
];

// Pop out and land beside the bag. Positioned in stage coordinates.
const SIDE: (Placed & { top: string; from: [number, number] })[] = [
  { icon: "combo", label: "Combo meal", left: "2%", top: "60%", width: "25%", rot: -6, from: [180, -80] },
  { icon: "juice", label: "Juice cup", left: "79%", top: "58%", width: "15%", rot: 8, from: [-160, -80] },
];

const DECOR: { icon: FoodIconName; left: string; top: string; width: string; rot: number }[] = [
  { icon: "popcorn", left: "6%", top: "14%", width: "10%", rot: -12 },
  { icon: "pizza", left: "86%", top: "24%", width: "9%", rot: 10 },
  { icon: "wings", left: "16%", top: "86%", width: "10%", rot: 8 },
  { icon: "ice-cream", left: "72%", top: "87%", width: "8%", rot: -8 },
];

const BAG_ICONS: FoodIconName[] = ["burger", "drumstick", "fries", "pizza", "soda"];

// Front panel with a die-cut handle slot (even-odd hole), drawn in a 300×360 box.
const FRONT =
  "M20 60 H280 L268 348 Q267 356 259 356 H41 Q33 356 32 348 Z " +
  "M118 92 a11 11 0 0 1 11 -11 h42 a11 11 0 0 1 11 11 a11 11 0 0 1 -11 11 h-42 a11 11 0 0 1 -11 -11 Z";

/** White YEET takeaway bag: die-cut handle, red logo, outlined food-icon band. */
function TakeawayBag() {
  return (
    <>
      <div aria-hidden="true" className="absolute -bottom-[3%] left-[6%] right-[6%] h-[7%] rounded-[50%] bg-black/30 blur-md" />
      {/* inside of the bag (seen above the front panel and through the handle slot) */}
      <div aria-hidden="true" className="absolute bottom-[1.5%] left-[6.7%] right-[6.7%] top-[5.5%] rounded-[4px] bg-[#ece5e3]" />

      {EMERGE.map((it) => (
        <div
          key={it.icon}
          data-emerge
          className="absolute"
          style={{ left: it.left, width: it.width, bottom: it.bottom, transform: `rotate(${it.rot}deg)` }}
        >
          <FoodIcon name={it.icon} title={it.label} className="sticker-edge h-auto w-full" />
        </div>
      ))}

      <svg viewBox="0 0 300 360" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="yeet-bag-shade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.07" />
            <stop offset="0.2" stopColor="#000" stopOpacity="0" />
            <stop offset="0.8" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.09" />
          </linearGradient>
        </defs>
        <path fillRule="evenodd" d={FRONT} fill="#fff" />
        <path fillRule="evenodd" d={FRONT} fill="url(#yeet-bag-shade)" />
        <path d="M20 60 H280" stroke="#e3d9d7" strokeWidth="2" />
      </svg>

      <div className="absolute left-1/2 top-[37%] w-[70%] -translate-x-1/2">
        <Image src="/brand/yeet-logo.png" alt="YEET RESTO CAFÉ logo on the takeaway bag" width={1080} height={579} className="h-auto w-full" />
      </div>
      <div aria-hidden="true" className="absolute inset-x-[13%] top-[73%] flex items-center justify-between">
        {BAG_ICONS.map((icon) => (
          <FoodIcon key={icon} name={icon} className="h-auto w-[17%]" />
        ))}
      </div>
    </>
  );
}

/**
 * Desktop: the bag slides in as the section arrives, then a pinned, scrubbed sequence turns it,
 * lifts items out of it, attaches stickers and slaps the logo on. Mobile and reduced motion
 * show the finished composition statically.
 */
export function TakeawayBagExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const bag = stage.querySelector<HTMLElement>("[data-bag]");
      const emerge = gsap.utils.toArray<HTMLElement>("[data-emerge]", stage);
      const side = gsap.utils.toArray<HTMLElement>("[data-side]", stage);
      const decor = gsap.utils.toArray<HTMLElement>("[data-bag-decor]", stage);
      const logo = stage.querySelector<HTMLElement>("[data-bag-logo]");
      if (!bag) return;

      // Stage 1 — the bag enters as the section scrolls into view (before the pin).
      gsap.fromTo(
        bag,
        { yPercent: 35, rotation: 5, opacity: 0 },
        {
          yPercent: 0,
          rotation: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 85%", end: "top 15%", scrub: 0.6 },
        },
      );

      gsap.set(emerge, { yPercent: 95, rotation: (i: number) => EMERGE[i].rot });
      gsap.set(side, {
        opacity: 0,
        scale: 0.4,
        rotation: (i: number) => SIDE[i].rot,
        x: (i: number) => SIDE[i].from[0],
        y: (i: number) => SIDE[i].from[1],
      });
      gsap.set(decor, { opacity: 0, scale: 0, rotation: (i: number) => DECOR[i].rot });
      if (logo) gsap.set(logo, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: "+=170%", pin: true, scrub: 0.6, anticipatePin: 1 },
      });

      // Stage 2 — the bag turns slightly to show its design, then settles.
      tl.to(bag, { rotationY: -16, rotation: -2, duration: 1, ease: "sine.inOut" }, 0);
      tl.to(bag, { rotationY: 0, rotation: 0, duration: 0.8, ease: "sine.inOut" }, 1.1);
      // Stages 3–4 — the opening is in view and the food rises out of it.
      emerge.forEach((el, i) => {
        tl.to(el, { yPercent: 0, duration: 1, ease: "power2.out" }, 1.4 + i * 0.15);
      });
      tl.to(side, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.9, ease: "back.out(1.3)", stagger: 0.15 }, 2.2);
      // Stage 5 — small stickers follow and attach around the products.
      tl.to(decor, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)", stagger: 0.08 }, 2.8);
      // Stage 7 — the YEET logo sticker slaps onto the final presentation.
      if (logo) {
        tl.fromTo(logo, { opacity: 0, scale: 1.7, rotation: -16 }, { opacity: 1, scale: 1, rotation: -6, duration: 0.45, ease: "power4.out" }, 3.3);
      }
      tl.to({}, { duration: 0.6 });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="bag"
      data-surface="red"
      aria-labelledby="bag-title"
      className="surface-red paper-texture relative overflow-hidden py-20 lg:h-[100svh] lg:py-0"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] items-center gap-10 px-5 md:px-10 lg:h-full lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-display text-sm uppercase tracking-[0.25em] text-white/80">Takeaway</p>
          <h2 id="bag-title" className="mt-3 font-display text-[clamp(3rem,8vw,7.5rem)] uppercase leading-[0.85] text-white">
            Good mood.<br />To go.
          </h2>
          <p className="mt-6 max-w-sm font-body text-lg text-white/90">
            The YEET bag, packed and ready. Packaging art here is a stand-in until the final bag artwork and photos are supplied.
          </p>
          <div className="mt-8">
            <StickerButton href={SITE.orderUrl} surface="red">Order takeaway</StickerButton>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[640px]" style={{ perspective: 1100 }}>
            {DECOR.map((d) => (
              <div
                key={d.icon}
                data-bag-decor
                className="absolute"
                style={{ left: d.left, top: d.top, width: d.width, transform: `rotate(${d.rot}deg)` }}
              >
                <FoodIcon name={d.icon} className="sticker-edge h-auto w-full" />
              </div>
            ))}

            <div data-bag className="absolute left-[28%] top-[30%] w-[44%]" style={{ aspectRatio: "300 / 360", transformStyle: "preserve-3d" }}>
              <TakeawayBag />
            </div>

            {SIDE.map((it) => (
              <div
                key={it.icon}
                data-side
                className="absolute z-[3]"
                style={{ left: it.left, top: it.top, width: it.width, transform: `rotate(${it.rot}deg)` }}
              >
                <FoodIcon name={it.icon} title={it.label} className="sticker-edge h-auto w-full" />
              </div>
            ))}

            <div data-bag-logo className="absolute right-[1%] top-[3%] z-[4] w-[30%]" style={{ transform: "rotate(-6deg)" }}>
              <Image src="/brand/yeet-logo.png" alt="" width={1080} height={579} className="logo-die-cut h-auto w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
