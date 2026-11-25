import type { FoodIconName } from "@/components/icons/FoodIcons";
import { SITE } from "@/lib/site";

/**
 * DEMO MENU — centralized mock data for the UI phase.
 * Product names, descriptions, prices and availability are temporary sample content,
 * not the real YEET menu. Photos are CC0 stand-ins (see public/images/CREDITS.md).
 * Replace this file's contents when the real menu is supplied; every component reads from here.
 */
export type CategoryId = "burgers" | "chicken" | "pizza" | "sides" | "popcorn" | "drinks";
export type Availability = "available" | "limited" | "sold-out";

export type Category = {
  id: CategoryId;
  name: string;
  blurb: string;
  icon: FoodIconName;
  /** Product whose photo represents the category. */
  coverProductId: string;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  /** Sample price in the site currency (major units). */
  price: number;
  image: string;
  bestseller?: boolean;
  /** 0 = not spicy … 3 = hot. */
  spicy: 0 | 1 | 2 | 3;
  availability: Availability;
  featured?: boolean;
  icon: FoodIconName;
};

export const CATEGORIES: Category[] = [
  { id: "burgers", name: "Burgers", blurb: "Stacked, sauced, smashed.", icon: "burger", coverProductId: "yeet-stack" },
  { id: "chicken", name: "Chicken & Wings", blurb: "Crunchy outside, juicy inside.", icon: "drumstick", coverProductId: "crispy-drumsticks" },
  { id: "pizza", name: "Pizza", blurb: "Thin, crisp, loaded.", icon: "pizza", coverProductId: "pepperoni-pizza" },
  { id: "sides", name: "Fries & Sides", blurb: "Extras that steal the show.", icon: "fries", coverProductId: "classic-fries" },
  { id: "popcorn", name: "Popcorn", blurb: "Snack-sized trouble.", icon: "popcorn", coverProductId: "sweet-popcorn" },
  { id: "drinks", name: "Drinks & Juices", blurb: "Cold, fresh, shaken.", icon: "juice", coverProductId: "strawberry-shake" },
];

const img = (id: string) => `/images/food/${id}.webp`;

export const PRODUCTS: Product[] = [
  // Burgers
  { id: "classic-cheeseburger", name: "Classic Cheeseburger", category: "burgers", description: "Beef patty, melted cheddar, red onion and crisp greens on a toasted bun.", price: 8.9, image: img("classic-cheeseburger"), bestseller: true, spicy: 0, availability: "available", icon: "burger" },
  { id: "double-smash", name: "Double Smash", category: "burgers", description: "Two smashed beef patties, double cheese, crispy bacon and pickles.", price: 11.9, image: img("double-smash"), bestseller: true, spicy: 0, availability: "available", featured: true, icon: "double-burger" },
  { id: "crispy-chicken-burger", name: "Crispy Chicken Burger", category: "burgers", description: "Crunchy fried chicken, purple slaw and a kick of spicy mayo.", price: 9.9, image: img("crispy-chicken-burger"), spicy: 1, availability: "available", featured: true, icon: "burger" },
  { id: "yeet-stack", name: "The YEET Stack", category: "burgers", description: "A tall beef stack with pickled onion, greens and house sauce on glossy brioche.", price: 12.5, image: img("yeet-stack"), spicy: 0, availability: "limited", icon: "double-burger" },
  { id: "garden-burger", name: "Garden Crunch Burger", category: "burgers", description: "Crispy patty, cucumber, tomato and fresh greens on a sesame bun.", price: 8.5, image: img("garden-burger"), spicy: 0, availability: "available", icon: "burger" },
  { id: "classic-combo", name: "Classic Combo", category: "burgers", description: "A cheeseburger with a heap of golden fries.", price: 13.9, image: img("classic-combo"), bestseller: true, spicy: 0, availability: "available", icon: "combo" },
  // Chicken & wings
  { id: "crispy-drumsticks", name: "Crispy Drumsticks (3 pc)", category: "chicken", description: "Golden, crunchy coating with juicy meat underneath.", price: 7.9, image: img("crispy-drumsticks"), bestseller: true, spicy: 0, availability: "available", icon: "drumstick" },
  { id: "fried-chicken-basket", name: "Fried Chicken Basket", category: "chicken", description: "Mixed pieces for sharing, fried to order.", price: 15.9, image: img("fried-chicken-basket"), spicy: 0, availability: "available", icon: "fried-chicken" },
  { id: "hot-wings", name: "Hot Glazed Wings (6 pc)", category: "chicken", description: "Sticky, spicy glaze over crisp wings.", price: 8.9, image: img("hot-wings"), spicy: 3, availability: "available", featured: true, icon: "wings" },
  { id: "bbq-wings", name: "Smoky BBQ Wings (6 pc)", category: "chicken", description: "Grilled wings brushed with smoky barbecue sauce.", price: 8.9, image: img("bbq-wings"), spicy: 1, availability: "available", icon: "wings" },
  { id: "chicken-tenders", name: "Chicken Tenders (4 pc)", category: "chicken", description: "Crunchy strips with two dipping sauces.", price: 7.5, image: img("chicken-tenders"), spicy: 0, availability: "available", icon: "fried-chicken" },
  // Pizza
  { id: "pepperoni-pizza", name: "Pepperoni & Olive Pizza", category: "pizza", description: "Pepperoni, black olives and mozzarella on a crisp base.", price: 13.9, image: img("pepperoni-pizza"), bestseller: true, spicy: 1, availability: "available", icon: "pizza" },
  { id: "cheese-pizza", name: "Four Cheese Pizza", category: "pizza", description: "A golden blend of four cheeses, baked until bubbling.", price: 12.5, image: img("cheese-pizza"), spicy: 0, availability: "available", icon: "pizza" },
  { id: "veggie-pizza", name: "Garden Veggie Pizza", category: "pizza", description: "Tomato, sweetcorn, olives and peppers.", price: 12.9, image: img("veggie-pizza"), spicy: 0, availability: "sold-out", icon: "pizza" },
  // Fries & sides
  { id: "classic-fries", name: "Golden Fries", category: "sides", description: "Crispy, salted and served with ketchup.", price: 3.9, image: img("classic-fries"), bestseller: true, spicy: 0, availability: "available", icon: "fries" },
  { id: "loaded-fries", name: "Loaded Cheese Fries", category: "sides", description: "Fries under warm cheese sauce and crispy bits.", price: 6.9, image: img("loaded-fries"), spicy: 0, availability: "available", icon: "loaded-fries" },
  { id: "rings-wings-platter", name: "Rings & Wings Platter", category: "sides", description: "Onion rings, hot wings, veggie sticks and a cool dip.", price: 16.9, image: img("rings-wings-platter"), spicy: 2, availability: "limited", icon: "combo" },
  // Popcorn
  { id: "popcorn-chicken", name: "Popcorn Chicken", category: "popcorn", description: "Bite-sized crispy chicken with fries and a dip.", price: 6.9, image: img("popcorn-chicken"), bestseller: true, spicy: 1, availability: "available", icon: "popcorn-chicken" },
  { id: "sweet-popcorn", name: "Sweet Butter Popcorn", category: "popcorn", description: "Freshly popped and lightly sweet.", price: 3.5, image: img("sweet-popcorn"), spicy: 0, availability: "available", icon: "popcorn" },
  // Drinks & juices
  { id: "orange-juice", name: "Fresh Orange Juice", category: "drinks", description: "Squeezed to order, served cold.", price: 4.5, image: img("orange-juice"), spicy: 0, availability: "available", icon: "juice" },
  { id: "strawberry-shake", name: "Strawberry Milkshake", category: "drinks", description: "Thick, creamy and topped with fresh strawberry.", price: 5.9, image: img("strawberry-shake"), spicy: 0, availability: "available", icon: "milkshake" },
  { id: "chocolate-shake", name: "Chocolate Milkshake", category: "drinks", description: "Rich chocolate, blended thick.", price: 5.9, image: img("chocolate-shake"), bestseller: true, spicy: 0, availability: "available", icon: "milkshake" },
  { id: "iced-cola", name: "Iced Cola & Lemon", category: "drinks", description: "Fizzy, ice-cold, with a twist of lemon.", price: 2.9, image: img("iced-cola"), spicy: 0, availability: "available", icon: "soda" },
  { id: "lemonade", name: "Cucumber Lemonade", category: "drinks", description: "Fresh lemon, cucumber and a little fizz.", price: 4.2, image: img("lemonade"), spicy: 0, availability: "limited", icon: "juice" },
];

export const FEATURED = PRODUCTS.filter((p) => p.featured).slice(0, 3);

export const isCategoryId = (v: string | null | undefined): v is CategoryId =>
  !!v && CATEGORIES.some((c) => c.id === v);

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export const categoryCover = (c: Category) => productById(c.coverProductId)?.image ?? PRODUCTS[0].image;

const priceFormat = new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Deterministic on server and client (fixed locale), so no hydration mismatch. */
export const formatPrice = (value: number) => `${SITE.currency}${priceFormat.format(value)}`;

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: "Available",
  limited: "Limited today",
  "sold-out": "Sold out",
};
