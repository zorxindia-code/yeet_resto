/**
 * Photography used outside the menu dataset (menu product photos live in lib/menu.ts).
 *
 * All current files are CC0 demo stand-ins (see public/images/CREDITS.md). Swap a path to
 * YEET's own photography and every component using it updates; no layout or animation
 * code needs to change. Cutouts are transparent WebP; keep transparency when replacing them.
 */
type Cutout = { src: string; width: number; height: number; alt: string };

export const PHOTOS = {
  hero: {
    burger: { src: "/images/food/cutouts/burger.webp", width: 916, height: 646, alt: "Cheeseburger with tomato, cheese and crisp lettuce" },
    drumstick: { src: "/images/food/cutouts/drumstick.webp", width: 1000, height: 503, alt: "Crispy fried chicken drumstick" },
    fries: { src: "/images/food/cutouts/fries.webp", width: 740, height: 633, alt: "Cup of golden fries with herbs" },
  } satisfies Record<string, Cutout>,
  revealBurger: "/images/food/reveal-burger.webp",
  lifestyle: {
    room: "/images/lifestyle/room.webp",
    crew: "/images/lifestyle/crew.webp",
    kitchen: "/images/lifestyle/kitchen.webp",
  },
  gallery: [1, 2, 3, 4, 5, 6].map((n) => `/images/lifestyle/gallery-${n}.webp`),
};
