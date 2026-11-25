"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { FoodIcon, type FoodIconName } from "@/components/icons/FoodIcons";

const WORDS = ["BITE IT!", "CRUNCH IT!", "LOVE IT!", "YEET IT!"];
const ICONS: FoodIconName[] = ["burger", "drumstick", "fries", "pizza", "juice", "popcorn"];

function Group({ idx }: { idx: number }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={idx > 0 ? true : undefined}>
      {Array.from({ length: 2 }).flatMap((_, rep) =>
        WORDS.map((w, i) => (
          <span key={`${rep}-${w}`} className="flex shrink-0 items-center">
            <span className="sticker-label px-6 text-[clamp(2.5rem,7vw,6rem)] text-white">{w}</span>
            <FoodIcon name={ICONS[(i + rep * 2) % ICONS.length]} className="h-12 w-12 shrink-0 md:h-16 md:w-16" />
          </span>
        )),
      )}
    </div>
  );
}

/** Sticker-tape marquee. Speed reacts to scroll velocity and direction. */
export function AnimatedMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section || prefersReducedMotion()) return;

    // Starts paused; only runs while the strip is on screen.
    const tween = gsap.to(track, { xPercent: -50, ease: "none", duration: 24, repeat: -1, paused: true });
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
      onUpdate: (self) => {
        const v = Math.abs(self.getVelocity());
        const dir = self.direction === -1 ? -1 : 1;
        gsap.to(tween, { timeScale: dir * (1 + Math.min(v / 1200, 4)), duration: 0.5, overwrite: true });
      },
    });

    return () => {
      st.kill();
      tween.kill();
    };
  }, []);

  return (
    // Layered-paper hand-off: this white sheet slides up over the bottom of the red hero.
    <section
      ref={sectionRef}
      data-surface="white"
      aria-label="Brand slogans"
      className="surface-white relative z-10 -mt-12 overflow-hidden rounded-t-[48px] py-12 shadow-[0_-24px_40px_-28px_rgba(0,0,0,0.5)] md:-mt-16 md:rounded-t-[72px] md:py-16"
    >
      <div className="-rotate-2 bg-brand py-5 shadow-[0_10px_0_-4px_rgba(0,0,0,0.08)] md:py-7">
        <div ref={trackRef} className="marquee-track">
          <Group idx={0} />
          <Group idx={1} />
        </div>
      </div>
      <p className="sr-only">Bite it, crunch it, love it, YEET it.</p>
    </section>
  );
}
