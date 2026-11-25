"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/motion";
import { FoodIcon, type FoodIconName } from "@/components/icons/FoodIcons";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/assets";
import { StickerButton } from "@/components/StickerButton";
import { SITE } from "@/lib/site";

type Tile = {
  label: string;
  caption: string;
  span: string;
  rot: number;
  icon?: FoodIconName;
  video?: boolean;
};

// Placeholder social content, not customer posts.
// Spans tile a 6×3 grid on desktop and a 2-column grid on mobile (with dense packing).
const TILES: Tile[] = [
  { label: "Guest taking a big burger bite", caption: "First bite", span: "col-span-2 row-span-2 md:col-span-3 md:row-span-2", rot: -1.5, icon: "burger" },
  { label: "Fries dipped in ketchup", caption: "Crunch check", span: "col-span-1 md:col-span-2", rot: 2.5, icon: "fries" },
  { label: "Warm café interior at night", caption: "Night shift", span: "col-span-1 row-span-2 md:col-span-1 md:row-span-2", rot: -2, icon: "popcorn" },
  { label: "Chef at the stove, steam rising", caption: "Kitchen cam", span: "col-span-1 md:col-span-2", rot: 1.5, video: true },
  { label: "Guest enjoying a burger", caption: "Good mood", span: "col-span-2 md:col-span-3", rot: -1, icon: "juice" },
  { label: "Pizza night with friends", caption: "Slice o'clock", span: "col-span-2 md:col-span-3", rot: 1.5, icon: "pizza" },
];

/** Asymmetric sticker-collage gallery. Images are placeholders until real social content is supplied. */
export function SocialGallery() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        gsap.utils.toArray<HTMLElement>("[data-tile]", root),
        { y: 50, opacity: 0, rotation: (i: number) => TILES[i].rot },
        {
          y: 0,
          opacity: 1,
          rotation: (i: number) => TILES[i].rot,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: root, start: "top 78%", once: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="gallery" data-surface="red" aria-labelledby="gallery-title" className="surface-red paper-texture relative overflow-hidden py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="gallery-title" className="font-display text-[clamp(3rem,9vw,8.5rem)] uppercase leading-[0.85] text-white">
            Meet the<br />YEET gang.
          </h2>
          <StickerButton href={SITE.instagramUrl} variant="secondary" surface="red" cursor="VIEW">
            Follow on Instagram
          </StickerButton>
        </div>

        <ul className="mt-14 grid grid-flow-row-dense auto-rows-[150px] grid-cols-2 gap-4 md:auto-rows-[200px] md:grid-cols-6 md:gap-6">
          {TILES.map((tile, i) => (
            <li
              key={tile.label}
              data-tile
              className={`${tile.span} group relative`}
              style={{ transform: `rotate(${tile.rot}deg)` }}
            >
              <div className="relative h-full rounded-[22px] bg-white p-2 shadow-[0_16px_24px_-18px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:rotate-0">
                <div className="relative h-full overflow-hidden rounded-[16px]">
                  <Photo
                    src={PHOTOS.gallery[i]}
                    alt={tile.label}
                    label={tile.label}
                    ratio="auto"
                    className="h-full w-full"
                    sizes="(min-width: 768px) 45vw, 90vw"
                  />
                  {tile.video ? (
                    <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white ring-4 ring-white">
                      <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor"><path d="M7 4l13 8-13 8z" /></svg>
                    </span>
                  ) : null}
                </div>
                {tile.icon ? (
                  <FoodIcon name={tile.icon} className="sticker-edge absolute -right-3 -top-4 w-14 text-brand md:w-20" />
                ) : null}
                <span className="sticker-label absolute bottom-3 left-3 rounded-md bg-white px-2 py-1 text-[11px] text-brand">
                  {tile.caption}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-body text-sm text-white">Placeholder social content. Not customer posts. Replace with approved content.</p>
      </div>
    </section>
  );
}
