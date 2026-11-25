import type { CategoryId } from "@/lib/menu";

/**
 * Real photography slots.
 *
 * Every slot is empty until the real asset exists under /public. Set a path
 * (for example "/images/food/hero-burger.webp") and the matching <PhotoPlaceholder>
 * renders the optimised photo instead of the labelled placeholder. Layout and
 * animation code never needs to change.
 */
type Slot = string | undefined;

export const PHOTOS: {
  heroBurger: Slot; // /images/food/hero-burger.webp, 1:1
  revealBurger: Slot; // /images/food/reveal-burger.webp, 4:5, same framing as the sticker illustration
  categories: Partial<Record<CategoryId, string>>; // /images/food/category-<id>.webp, 16:9 (burgers) or 4:3
  products: Partial<Record<string, string>>; // /images/food/product-<id>.webp, 4:5 or 4:3
  lifestyle: { room: Slot; crew: Slot; kitchen: Slot }; // /images/lifestyle/*.webp, 4:5
  gallery: Slot[]; // /images/lifestyle/gallery-<n>.webp, in tile order
} = {
  heroBurger: undefined,
  revealBurger: undefined,
  categories: {},
  products: {},
  lifestyle: { room: undefined, crew: undefined, kitchen: undefined },
  gallery: [],
};
