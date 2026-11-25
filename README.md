# YEET RESTO CAFÉ — The YEET Stickerverse

Frontend for the YEET RESTO CAFÉ website. **Stick it. Peel it. YEET it.**

Next.js (App Router) · TypeScript · Tailwind CSS v4 · GSAP (ScrollTrigger, Draggable) · Lenis.
This is the UI phase only: there is no backend, ordering, payment or auth.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
```

## Routes

| Route   | What it is |
| ------- | ---------- |
| `/`     | Homepage: preloader → hero → marquee → categories → featured → sticker-to-reality reveal → burger assembly → brand story → takeaway bag → offers → gallery → location → sticker playground footer |
| `/menu` | Fully prerendered menu grouped by category: sticky category tabs, search, filters (bestsellers, spicy, available now), product dialog. Deep links: `/menu?cat=burgers` (`chicken`, `pizza`, `sides`, `popcorn`, `drinks`) |

## Replacing placeholders

Everything marked *placeholder* on the site is meant to be swapped. None of it changes animation code.

| What | Where |
| ---- | ----- |
| Menu (24 demo products: names, descriptions, sample prices, photos, bestseller, spice level, availability) | `lib/menu.ts`, the single source for the homepage and `/menu` |
| Hero cutouts, reveal photo, lifestyle and gallery photos | `lib/assets.ts` (files in `public/images/…`) |
| Photo credits for the current demo photography | `public/images/CREDITS.md` |
| Address, hours, phone, email, currency, order/maps/WhatsApp/social links | `lib/site.ts`, or the `NEXT_PUBLIC_*` env vars it reads |
| Offers | `components/OffersSection.tsx` |
| Brand story copy | `components/BrandExperience.tsx` |
| Illustrated burger layers (scroll assembly) | `components/illustrations/BurgerLayers.tsx` (`BURGER_LAYERS`, bottom → top) |
| Takeaway bag artwork | `components/TakeawayBagExperience.tsx` (`TakeawayBag`) |

### Demo photography

All food, lifestyle and gallery photos are **temporary CC0 stand-ins** (StockSnap and rawpixel via Openverse), downloaded,
re-encoded to WebP and served at responsive sizes as AVIF/WebP by `next/image`. Hero cutouts are transparent WebP, lifted
locally with Apple's Vision framework. Swap in YEET's own photography before launch; see `public/images/CREDITS.md`.

### Environment variables (all optional)

```
NEXT_PUBLIC_SITE_URL       # canonical URL for metadata
NEXT_PUBLIC_CURRENCY       # price prefix for the demo menu (defaults to $)
NEXT_PUBLIC_ORDER_URL      # "Order now" buttons (defaults to /menu)
NEXT_PUBLIC_MAPS_URL
NEXT_PUBLIC_DIRECTIONS_URL
NEXT_PUBLIC_WHATSAPP_URL
NEXT_PUBLIC_INSTAGRAM_URL
NEXT_PUBLIC_TIKTOK_URL
```

## Brand system

- **Colour:** brand red `#DD0303`, sampled from the original logo (`--color-brand` in `app/globals.css`), plus white/off-white and charcoal for body copy.
- **Type:** Fredoka (display) + DM Sans (body), via `next/font`.
- **Logo:** `public/brand/yeet-logo.png` is used as supplied, never redrawn. On red surfaces, `.logo-die-cut` adds a white die-cut ring around the silhouette as a presentation effect only.
- **Food icons:** `components/icons/FoodIcons.tsx` holds 18 SVG icons in one two-pass sticker style (white die-cut halo + red line art). Use them as `<FoodIcon name="burger" />`.

## Motion notes

- Lenis is the only smooth-scroll engine. It runs on GSAP's ticker and drives `ScrollTrigger.update` (`components/SmoothScrollProvider.tsx`).
- The sticker-peel preloader plays once per browser session. Later navigations use a short red-sheet wipe (`app/template.tsx`).
- Pinned sequences (burger assembly, takeaway bag) run at ≥1024px only. Phones get a static composition.
- `prefers-reduced-motion` skips the preloader, entrance animations, pins and the marquee. All content stays visible.
- Entrance animations use `fromTo` on wrapper elements without CSS transitions, so they never fight hover transitions.
- The hero burger is the LCP image: it loads eagerly at high priority and is never hidden with opacity.
- The footer sticker playground (and GSAP Draggable) is lazy-loaded when it nears the viewport.
# yeet_resto
# yeet_resto
