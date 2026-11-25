/**
 * Central place for brand/business placeholders.
 * Replace values here (or via NEXT_PUBLIC_* env vars) when real details are supplied.
 * Nothing in this file is a verified business fact.
 */
export const SITE = {
  name: "YEET RESTO CAFÉ",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  tagline: "Big bites. Bold flavours. Good moods.",
  // PLACEHOLDER — replace with real values
  address: "PLACEHOLDER — add street address",
  hours: "PLACEHOLDER — add opening hours",
  phone: "+00 000 000 000",
  email: "hello@example.com",
  orderUrl: process.env.NEXT_PUBLIC_ORDER_URL ?? "/menu",
  mapsUrl: process.env.NEXT_PUBLIC_MAPS_URL ?? "#contact",
  directionsUrl: process.env.NEXT_PUBLIC_DIRECTIONS_URL ?? "#contact",
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "#contact",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#gallery",
  tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "#gallery",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#bag" },
  { label: "Contact", href: "/#contact" },
] as const;
