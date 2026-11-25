/** Configured URL or null. Null renders as a visibly pending (disabled) control, never a dead link. */
const configured = (value: string | undefined) => (value && value.trim() ? value.trim() : null);

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
  // Pending client details: null until supplied (shown as "TBC", not as a dead tel:/mailto: link).
  phone: configured(process.env.NEXT_PUBLIC_PHONE),
  email: configured(process.env.NEXT_PUBLIC_EMAIL),
  // Until an ordering link exists, "Order" buttons open the menu.
  orderUrl: configured(process.env.NEXT_PUBLIC_ORDER_URL) ?? "/menu",
  orderConfigured: configured(process.env.NEXT_PUBLIC_ORDER_URL) !== null,
  mapsUrl: configured(process.env.NEXT_PUBLIC_MAPS_URL),
  directionsUrl: configured(process.env.NEXT_PUBLIC_DIRECTIONS_URL),
  whatsappUrl: configured(process.env.NEXT_PUBLIC_WHATSAPP_URL),
  instagramUrl: configured(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  tiktokUrl: configured(process.env.NEXT_PUBLIC_TIKTOK_URL),
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#bag" },
  { label: "Contact", href: "/#contact" },
] as const;
