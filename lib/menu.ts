import type { FoodIconName } from "@/components/icons/FoodIcons";

/**
 * YEET RESTO CAFÉ menu: the single source for every menu view (menu page, homepage
 * categories and search).
 *
 * Transcribed from the client's menu poster (received 2026-11-25). Only details printed on the
 * poster are filled in: no invented descriptions, ingredients, labels or prices. Spelling is
 * normalised (e.g. "Mozarall" → "Mozzarella"); each change and every unclear point is recorded
 * in `toConfirm`, and MENU_OPEN_QUESTIONS lists the questions that span several items.
 *
 * Photos were cut out of the same poster (public/images/menu/). The poster is 853×1280 px,
 * so they are small (about 80–400 px across before the 2× resample) and should be replaced by
 * the client's original photography when it arrives.
 */

export const CURRENCY = "AED";

export type CategoryId =
  | "smash-burgers"
  | "zinger-burgers"
  | "wings"
  | "loaded-fries"
  | "zinger-wraps"
  | "strips-meals"
  | "fries-sides"
  | "refreshments"
  | "kids-meals";

export type MenuImage = { src: string; width: number; height: number };

export type Category = {
  id: CategoryId;
  name: string;
  /** Short factual summary, built only from what the poster says about the section. */
  blurb: string;
  /** Line printed under the section heading on the poster; applies to every item in it. */
  note?: string;
  icon: FoodIconName;
  /** Photo representing the section. */
  cover: MenuImage | null;
};

export type Variant = { id: string; label: string; price: number };
export type AddOn = { id: string; label: string; price: number; /** e.g. "per extra patty" */ unit?: string };

export type Product = {
  id: string;
  /** URL-safe name; also the photo's filename. */
  slug: string;
  name: string;
  category: CategoryId;
  /** Poster wording, sentence-cased. Absent when the poster gives none. */
  description?: string;
  /** Ingredients printed on the poster (for this item, or for its whole section). */
  ingredients?: string[];
  /** Contents of a meal or combo, as printed. */
  includes?: string[];
  /** Fixed portion printed with a single-price item, e.g. "4 pcs". */
  portion?: string;
  /** Lowest price in AED. `null` = the poster shows conflicting prices (see `toConfirm`). */
  price: number | null;
  currency: typeof CURRENCY;
  /** What the variants differ by, used as the option group's label. */
  variantType?: "Pieces" | "Flavour";
  variants?: Variant[];
  addOns?: AddOn[];
  image: MenuImage | null;
  /** "extracted" = cut out of the menu poster; "missing" = the poster has no photo of this item. */
  imageStatus: "extracted" | "missing";
  /** Why the photo needs replacing before launch, beyond its low resolution. */
  imageNote?: string;
  icon: FoodIconName;
  /** Open questions for the client about this item. Not shown on the site. */
  toConfirm?: string[];
};

const photo = (folder: string, slug: string, width: number, height: number): MenuImage => ({
  src: `/images/menu/${folder}/${slug}.webp`,
  width,
  height,
});

const BRANDED_CUP = "The cup in this photo carries another brand's crown logo; replace with a YEET-branded or unbranded photo.";

const SMASH_INGREDIENTS = ["65g premium beef patty", "Signature sauce", "Pickles", "Caramelized onion", "Cheese"];
const EXTRA_PATTY: AddOn = { id: "extra-patty", label: "Extra patty", price: 5, unit: "each" };

export const CATEGORIES: Category[] = [
  {
    id: "smash-burgers",
    name: "Smash Burgers",
    blurb: "Single, double or triple. Spicy and BBQ too.",
    note: "65g premium beef patty · Signature sauce · Pickles · Caramelized onion · Cheese",
    icon: "double-burger",
    cover: photo("smash-burgers", "smash-burger-hero", 794, 439),
  },
  {
    id: "zinger-burgers",
    name: "Chicken Zinger Burgers",
    blurb: "Cheese, salad and signature sauce.",
    icon: "burger",
    cover: photo("zinger-burgers", "zinger-supreme", 340, 163),
  },
  {
    id: "wings",
    name: "Wings",
    blurb: "Boneless, buffalo or BBQ. 6 or 10 pieces.",
    icon: "wings",
    cover: photo("wings", "boneless-buffalo-wings", 383, 174),
  },
  {
    id: "loaded-fries",
    name: "Loaded Fries",
    blurb: "Cheese sauce, jalapeño, ranch powder, signature sauce.",
    icon: "loaded-fries",
    cover: photo("fries-and-sides", "loaded-fries", 593, 342),
  },
  {
    id: "zinger-wraps",
    name: "Zinger Wraps",
    blurb: "Classic or spicy, with salad and signature sauce.",
    icon: "wrap",
    cover: photo("wraps", "classic-zinger-wrap", 330, 180),
  },
  {
    id: "strips-meals",
    name: "Strips Meals",
    blurb: "3, 5 or 12 pieces of crispy chicken with fries and garlic.",
    icon: "combo",
    cover: photo("strips-meals", "family-strips-meal", 266, 193),
  },
  {
    id: "fries-sides",
    name: "Fries & Sides",
    blurb: "Fries, wedges, popcorn and mozzarella sticks.",
    icon: "fries",
    cover: photo("fries-and-sides", "french-fries", 195, 312),
  },
  {
    id: "refreshments",
    name: "Refreshments",
    blurb: "Peach, passion fruit and mango tea. Four shakes.",
    icon: "milkshake",
    cover: photo("refreshments", "milkshakes", 274, 304),
  },
  {
    id: "kids-meals",
    name: "Kids Meals",
    blurb: "Smash burger, popcorn or zinger.",
    icon: "burger-box",
    cover: photo("kids-meals", "kids-smash-burger-meal", 166, 139),
  },
];

type Draft = Omit<Product, "currency" | "slug" | "imageStatus"> & { slug?: string };
const item = (p: Draft): Product => ({
  ...p,
  slug: p.slug ?? p.id,
  currency: CURRENCY,
  imageStatus: p.image ? "extracted" : "missing",
});

export const PRODUCTS: Product[] = [
  // ——— Smash Burgers ———
  item({
    id: "single-patty-smash-burger",
    name: "Single Patty Smash Burger",
    category: "smash-burgers",
    ingredients: SMASH_INGREDIENTS,
    price: 9.99,
    addOns: [EXTRA_PATTY],
    image: photo("smash-burgers", "single-patty-smash-burger", 247, 161),
    icon: "burger",
  }),
  item({
    id: "double-patty-smash-burger",
    name: "Double Patty Smash Burger",
    category: "smash-burgers",
    ingredients: SMASH_INGREDIENTS,
    price: 14.99,
    addOns: [EXTRA_PATTY],
    image: photo("smash-burgers", "double-patty-smash-burger", 243, 171),
    icon: "double-burger",
  }),
  item({
    id: "triple-patty-smash-burger",
    name: "Triple Patty Smash Burger",
    category: "smash-burgers",
    ingredients: SMASH_INGREDIENTS,
    price: 19.99,
    addOns: [EXTRA_PATTY],
    image: photo("smash-burgers", "triple-patty-smash-burger", 234, 175),
    icon: "double-burger",
  }),
  item({
    id: "spicy-smash-burger",
    name: "Spicy Smash Burger",
    category: "smash-burgers",
    description: "Comes with jalapeño.",
    ingredients: SMASH_INGREDIENTS,
    price: 10.99,
    addOns: [EXTRA_PATTY],
    image: photo("smash-burgers", "spicy-smash-burger", 260, 119),
    icon: "burger",
    toConfirm: ["Does the +5 AED extra patty also apply to the Spicy Smash Burger?"],
  }),
  item({
    id: "bbq-smash-burger",
    name: "BBQ Smash Burger",
    category: "smash-burgers",
    description: "Comes with BBQ sauce.",
    ingredients: SMASH_INGREDIENTS,
    price: 10.99,
    addOns: [EXTRA_PATTY],
    image: photo("smash-burgers", "bbq-smash-burger", 257, 119),
    icon: "burger",
    toConfirm: [
      "Does the +5 AED extra patty also apply to the BBQ Smash Burger?",
      "Does the BBQ sauce replace the signature sauce or come in addition to it?",
    ],
  }),

  // ——— Chicken Zinger Burgers ———
  item({
    id: "zinger-burger",
    name: "Zinger Burger",
    category: "zinger-burgers",
    ingredients: ["Cheese", "Salad", "Signature sauce"],
    price: 9.99,
    image: photo("zinger-burgers", "zinger-burger", 253, 154),
    icon: "burger",
  }),
  item({
    id: "double-zinger-burger",
    name: "Double Zinger Burger",
    category: "zinger-burgers",
    ingredients: ["Cheese", "Salad", "Signature sauce"],
    price: 14.99,
    image: photo("zinger-burgers", "double-zinger-burger", 271, 158),
    icon: "double-burger",
  }),
  item({
    id: "spicy-zinger-burger",
    name: "Spicy Zinger Burger",
    category: "zinger-burgers",
    description: "With extra jalapeños.",
    price: 10.99,
    image: photo("zinger-burgers", "spicy-zinger-burger", 281, 164),
    icon: "burger",
  }),
  item({
    id: "zinger-supreme",
    name: "Zinger Supreme",
    category: "zinger-burgers",
    ingredients: ["Long bun", "Cheese", "Salad", "Signature sauce"],
    price: 14.99,
    image: photo("zinger-burgers", "zinger-supreme", 340, 163),
    icon: "burger",
  }),

  // ——— Wings ———
  item({
    id: "boneless-buffalo-wings",
    name: "Boneless Buffalo Wings",
    category: "wings",
    price: 17.99,
    variantType: "Pieces",
    variants: [
      { id: "6-pcs", label: "6 pcs", price: 17.99 },
      { id: "10-pcs", label: "10 pcs", price: 22.99 },
    ],
    image: photo("wings", "boneless-buffalo-wings", 383, 174),
    icon: "wings",
  }),
  item({
    id: "boneless-bbq-wings",
    name: "Boneless BBQ Wings",
    category: "wings",
    price: 17.99,
    variantType: "Pieces",
    variants: [
      { id: "6-pcs", label: "6 pcs", price: 17.99 },
      { id: "10-pcs", label: "10 pcs", price: 22.99 },
    ],
    image: photo("wings", "boneless-bbq-wings", 382, 172),
    icon: "wings",
  }),

  // ——— Loaded Fries ———
  item({
    id: "loaded-fries",
    name: "Loaded Fries",
    category: "loaded-fries",
    ingredients: ["Cheese sauce", "Jalapeño", "Ranch powder", "Signature sauce"],
    price: null,
    image: photo("fries-and-sides", "loaded-fries", 593, 342),
    imageNote:
      "The poster's price badge covers the right end of the tray, so that end is faded out. The tray is in the poster's green.",
    icon: "loaded-fries",
    toConfirm: ["Price: AED 12.99 on the Loaded Fries panel but AED 12.00 in the Fries & Sides list. Which is correct?"],
  }),

  // ——— Zinger Wraps ———
  item({
    id: "classic-zinger-wrap",
    name: "Classic Zinger Wrap",
    category: "zinger-wraps",
    ingredients: ["Cheese", "Salad", "Signature sauce", "Tomato"],
    price: 9.99,
    image: photo("wraps", "classic-zinger-wrap", 330, 180),
    icon: "wrap",
  }),
  item({
    id: "spicy-zinger-wrap",
    name: "Spicy Zinger Wrap",
    category: "zinger-wraps",
    ingredients: ["Salad", "Cheese", "Signature sauce", "Jalapeño", "Tomato"],
    price: 10.99,
    image: photo("wraps", "spicy-zinger-wrap", 338, 191),
    icon: "wrap",
  }),

  // ——— Strips Meals ———
  item({
    id: "light-meal-combo",
    name: "Light Meal Combo",
    category: "strips-meals",
    includes: ["3 pcs crispy chicken", "1 bun", "Garlic", "Fries", "1 drink"],
    price: 12.99,
    image: photo("strips-meals", "light-meal-combo", 268, 177),
    imageNote: BRANDED_CUP,
    icon: "combo",
    toConfirm: ["Which drinks can be chosen as the \"1 drink\"?"],
  }),
  item({
    id: "strips-meal",
    name: "Strips Meal",
    category: "strips-meals",
    includes: ["5 pcs crispy chicken", "Bun", "Cola", "Fries", "Garlic"],
    price: 19.99,
    image: photo("strips-meals", "strips-meal", 235, 184),
    imageNote: BRANDED_CUP,
    icon: "combo",
  }),
  item({
    id: "family-strips-meal",
    name: "Family Strips Meal",
    category: "strips-meals",
    includes: ["12 pcs crispy chicken", "Fries", "2 garlic", "2 buns"],
    price: 29.99,
    image: photo("strips-meals", "family-strips-meal", 266, 193),
    imageNote: BRANDED_CUP,
    icon: "combo",
    toConfirm: ["The photo shows a drink, but the poster's contents list has none. Does the Family Strips Meal include a drink?"],
  }),

  // ——— Fries & Sides ———
  item({
    id: "french-fries",
    name: "French Fries",
    category: "fries-sides",
    price: 6,
    image: photo("fries-and-sides", "french-fries", 195, 312),
    imageNote: "The fries carton carries another brand's crown logo; replace with a YEET-branded or unbranded photo.",
    icon: "fries",
  }),
  item({ id: "curly-fries", name: "Curly Fries", category: "fries-sides", price: 7, image: null, icon: "fries" }),
  item({ id: "potato-wedges", name: "Potato Wedges", category: "fries-sides", price: 7, image: null, icon: "fries" }),
  item({
    id: "popcorn",
    name: "Popcorn",
    category: "fries-sides",
    price: 7,
    variantType: "Pieces",
    variants: [
      { id: "15-pcs", label: "15 pcs", price: 7 },
      { id: "30-pcs", label: "30 pcs", price: 12 },
    ],
    image: null,
    icon: "popcorn-chicken",
    toConfirm: ["Is \"Popcorn\" popcorn chicken (like the Kids Popcorn Meal photo) or snack popcorn?"],
  }),
  item({
    id: "mozzarella-sticks",
    name: "Mozzarella Sticks",
    category: "fries-sides",
    portion: "4 pcs",
    price: 7,
    image: null,
    icon: "fries",
    toConfirm: ["Spelled \"Mozarall Sticks\" on the poster; shown as \"Mozzarella Sticks\"."],
  }),
  item({ id: "crazy-fries", name: "Crazy Fries", category: "fries-sides", price: 12, image: null, icon: "loaded-fries", toConfirm: ["What comes on Crazy Fries? The poster has no description."] }),
  item({ id: "cheese-fries", name: "Cheese Fries", category: "fries-sides", price: 12, image: null, icon: "loaded-fries" }),

  // ——— Refreshments ———
  item({ id: "peach-tea", name: "Peach Tea", category: "refreshments", price: 4, image: null, icon: "juice" }),
  item({ id: "passion-fruit-tea", name: "Passion Fruit Tea", category: "refreshments", price: 4, image: null, icon: "juice" }),
  item({ id: "mango-tea", name: "Mango Tea", category: "refreshments", price: 4, image: null, icon: "juice" }),
  item({
    id: "shakes",
    name: "Shakes",
    category: "refreshments",
    price: 10,
    variantType: "Flavour",
    variants: [
      { id: "oreo", label: "Oreo", price: 10 },
      { id: "vanilla", label: "Vanilla", price: 10 },
      { id: "chocolate", label: "Chocolate", price: 10 },
      { id: "lotus-milk", label: "Lotus Milk", price: 10 },
    ],
    image: photo("refreshments", "milkshakes", 274, 304),
    imageNote:
      "One group photo for all four shakes (it doesn't show a specific flavour). The cups carry another brand's crown logo.",
    icon: "milkshake",
    toConfirm: [
      "The poster lists four shakes at AED 10.00 each; they are grouped here as one item with a flavour choice.",
      "\"Vanila\" on the poster is shown as \"Vanilla\".",
      "Is \"Lotus Milk Shake\" a Lotus (Biscoff) milkshake?",
    ],
  }),

  // ——— Kids Meals ———
  item({
    id: "kids-smash-burger-meal",
    name: "Kids Smash Burger Meal",
    category: "kids-meals",
    price: 13.99,
    image: photo("kids-meals", "kids-smash-burger-meal", 166, 139),
    imageNote: "The kids' cup carries another brand's crown badge; replace with a YEET-branded or unbranded photo.",
    icon: "burger-box",
  }),
  item({
    id: "kids-popcorn-meal",
    name: "Kids Popcorn Meal",
    category: "kids-meals",
    price: 13.99,
    image: photo("kids-meals", "kids-popcorn-meal", 176, 140),
    imageNote: "The kids' cup carries another brand's crown badge; replace with a YEET-branded or unbranded photo.",
    icon: "burger-box",
    toConfirm: ["Named \"Kid Popcorn Meal\" on the poster; shown as \"Kids Popcorn Meal\" to match the other two."],
  }),
  item({
    id: "kids-zinger-burger-meal",
    name: "Kids Zinger Burger Meal",
    category: "kids-meals",
    price: 13.99,
    image: photo("kids-meals", "kids-zinger-burger-meal", 162, 141),
    imageNote: "The kids' cup carries another brand's crown badge; replace with a YEET-branded or unbranded photo.",
    icon: "burger-box",
  }),
];

/** Questions that cover several items or the menu as a whole. */
export const MENU_OPEN_QUESTIONS = [
  "Kids meals: the poster lists no contents. The photos show a main, fries and a drink. What exactly is included, and which drinks?",
  "Is \"Garlic\" in the strips meals a garlic sauce or dip?",
  "Are the teas served hot or iced?",
  "\"REFRESHINMENT\" on the poster is shown as \"Refreshments\".",
];

export const isCategoryId = (v: string | null | undefined): v is CategoryId =>
  !!v && CATEGORIES.some((c) => c.id === v);

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export const productsIn = (id: CategoryId) => PRODUCTS.filter((p) => p.category === id);

/**
 * "AED 9.99" with a no-break space. Built by hand rather than with Intl currency formatting,
 * whose output varies between ICU versions (server vs. browser) and would break hydration.
 */
export const formatPrice = (value: number) => `${CURRENCY} ${value.toFixed(2)}`;

/** True when the variants are priced differently (e.g. 6 pcs vs 10 pcs). */
export const hasPriceRange = (p: Product) => !!p.variants && new Set(p.variants.map((v) => v.price)).size > 1;

/** Headline price for cards: "AED 9.99", "From AED 17.99" or "Price TBC". */
export function priceLabel(p: Product): string {
  if (p.price === null) return "Price TBC";
  return hasPriceRange(p) ? `From ${formatPrice(p.price)}` : formatPrice(p.price);
}

/** Text searched by the menu's search box: names, wording, ingredients and options. */
export function searchText(p: Product): string {
  return [
    p.name,
    categoryById(p.category).name,
    p.description,
    p.portion,
    ...(p.ingredients ?? []),
    ...(p.includes ?? []),
    ...(p.variants?.map((v) => v.label) ?? []),
    ...(p.addOns?.map((a) => a.label) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
