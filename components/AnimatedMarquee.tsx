"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { FoodIcon, type FoodIconName } from "@/components/icons/FoodIcons";

const WORDS = ["BITE IT!", "CRUNCH IT!", "LOVE IT!", "YEET IT!"];
const ICONS: FoodIconName[] = ["star", "fries", "drumstick", "burger", "milkshake", "wings"];

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
    // The hand-off from the red hero is the scroll wave placed above this section (app/page.tsx).
    <section
      ref={sectionRef}
      data-surface="white"
      aria-label="Brand slogans"
      className="surface-white relative z-10 overflow-hidden pb-12 pt-8 md:pb-16 md:pt-10"
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
