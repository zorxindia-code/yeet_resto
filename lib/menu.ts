import type { FoodIconName } from "@/components/icons/FoodIcons";

/**
 * SAMPLE MENU — local mock data for the UI phase.
 * Names, descriptions and prices are placeholders, not real products.
 */
export type CategoryId = "burgers" | "chicken" | "pizza" | "sides" | "popcorn" | "drinks";

export type Category = {
  id: CategoryId;
  name: string;
  blurb: string;
  icon: FoodIconName;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  price: string | null; // null = "PRICE TBA"
  bestseller?: boolean;
  spicy?: 0 | 1 | 2 | 3;
  featured?: boolean;
  icon: FoodIconName;
  dietary: string[]; // placeholder dietary tags
};

export const CATEGORIES: Category[] = [
  { id: "burgers", name: "Burgers", blurb: "Stacked, sauced, sticky.", icon: "burger" },
  { id: "chicken", name: "Chicken & Wings", blurb: "Crispy, saucy, bone-in.", icon: "drumstick" },
  { id: "pizza", name: "Pizza", blurb: "Slice by slice.", icon: "pizza" },
  { id: "sides", name: "Fries & Sides", blurb: "Extras that steal the show.", icon: "fries" },
  { id: "popcorn", name: "Popcorn", blurb: "Snack-sized trouble.", icon: "popcorn" },
  { id: "drinks", name: "Drinks & Juices", blurb: "Cold, sweet, fizzy.", icon: "juice" },
];

export const PRODUCTS: Product[] = [
  { id: "classic-yeet", name: "Classic YEET Burger", category: "burgers", description: "Sample description: single patty, sauce, crisp toppings.", price: null, bestseller: true, featured: true, icon: "burger", dietary: ["Allergens TBC"] },
  { id: "double-yeet", name: "Double YEET Burger", category: "burgers", description: "Sample description: two patties, double cheese.", price: null, spicy: 2, featured: true, icon: "double-burger", dietary: ["Allergens TBC"] },
  { id: "crispy-drumsticks", name: "Crispy Drumsticks", category: "chicken", description: "Sample description: crisp coating, juicy inside.", price: null, bestseller: true, featured: true, icon: "drumstick", dietary: ["Allergens TBC"] },
  { id: "hot-wings", name: "Hot Wings (6 pc)", category: "chicken", description: "Sample description: tossed in a spicy sauce.", price: null, spicy: 3, icon: "wings", dietary: ["Allergens TBC"] },
  { id: "fried-bucket", name: "Fried Chicken Bucket", category: "chicken", description: "Sample description: shareable mixed pieces.", price: null, icon: "fried-chicken", dietary: ["Allergens TBC"] },
  { id: "pepperoni-slice", name: "Pepperoni Slice", category: "pizza", description: "Sample description: tomato, mozzarella, pepperoni.", price: null, bestseller: true, icon: "pizza", dietary: ["Allergens TBC"] },
  { id: "yeet-fries", name: "YEET Fries", category: "sides", description: "Sample description: golden, salted, hot.", price: null, icon: "fries", dietary: ["Vegetarian TBC"] },
  { id: "loaded-fries", name: "Loaded Cheese Fries", category: "sides", description: "Sample description: fries, cheese sauce, toppings.", price: null, spicy: 1, icon: "loaded-fries", dietary: ["Allergens TBC"] },
  { id: "popcorn-chicken", name: "Popcorn Chicken", category: "popcorn", description: "Sample description: bite-sized crispy chicken.", price: null, bestseller: true, featured: true, icon: "popcorn-chicken", dietary: ["Allergens TBC"] },
  { id: "caramel-popcorn", name: "Sweet Popcorn", category: "popcorn", description: "Sample description: light, sweet, shareable.", price: null, icon: "popcorn", dietary: ["Vegetarian TBC"] },
  { id: "orange-juice", name: "Fresh Orange Juice", category: "drinks", description: "Sample description: chilled juice.", price: null, icon: "juice", dietary: ["Vegan TBC"] },
  { id: "soft-drink", name: "Iced Soft Drink", category: "drinks", description: "Sample description: fizzy, cold, classic.", price: null, icon: "soda", dietary: ["Allergens TBC"] },
  { id: "vanilla-shake", name: "Vanilla Milkshake", category: "drinks", description: "Sample description: thick and creamy.", price: null, icon: "milkshake", dietary: ["Vegetarian TBC"] },
];

export const isCategoryId = (v: string | undefined): v is CategoryId =>
  !!v && CATEGORIES.some((c) => c.id === v);
