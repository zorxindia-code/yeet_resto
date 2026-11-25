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
| `/`     | Homepage: preloader → hero → marquee → categories → (phones: combo promo) → burger assembly → brand story → takeaway bag → offers → gallery → location → sticker playground footer, with scroll-driven waves at each red/white boundary |
| `/menu` | Fully prerendered menu grouped by category: sticky category tabs, search (names, ingredients, sizes, flavours), product dialog with sizes, flavours and extras. Deep links: `/menu?cat=smash-burgers` (`zinger-burgers`, `wings`, `loaded-fries`, `zinger-wraps`, `strips-meals`, `fries-sides`, `refreshments`, `kids-meals`) |

## Replacing placeholders

Everything marked *placeholder* on the site is meant to be swapped. None of it changes animation code.

| What | Where |
| ---- | ----- |
| Menu (the client's real menu in AED: 31 items in 9 categories, with sizes, flavours, extras and open questions in `toConfirm`) | `lib/menu.ts`, the single source for the homepage and `/menu` |
| Menu photos (cut out of the client's menu poster) | `public/images/menu/<section>/<slug>.webp`, referenced from `lib/menu.ts` |
| Hero cutouts, reveal photo, lifestyle and gallery photos | `lib/assets.ts` (files in `public/images/…`) |
| Photo credits for the current demo photography | `public/images/CREDITS.md` |
| Address, hours, phone, email, order/maps/WhatsApp/social links | `lib/site.ts`, or the `NEXT_PUBLIC_*` env vars it reads |
| Offers | `components/OffersSection.tsx` |
| Brand story copy | `components/BrandExperience.tsx` |
| Illustrated burger layers (scroll assembly) | `components/illustrations/BurgerLayers.tsx` (`BURGER_LAYERS`, bottom → top) |
| Takeaway bag artwork | `components/TakeawayBagExperience.tsx` (`TakeawayBag`) |

### Photography

**Menu photos** are cut out of the client's menu poster (853×1280 px) with Apple's Vision subject-lifting, cleaned at the
edges, resampled 2× (Lanczos, no generative upscaling) and saved as transparent WebP. They are small, so `MenuPhoto` shows
them near their real size on a paper background instead of stretching them. Items the poster has no photo for show a
labelled "Photo coming soon" placeholder. Replace a file in `public/images/menu/` (keep the transparency) and update its
`width`/`height` in `lib/menu.ts`; several photos also need replacing because the cups and cartons carry another brand's
crown logo (see `imageNote` in `lib/menu.ts`).

**Hero cutouts, the reveal photo, lifestyle and gallery photos** are still **temporary CC0 stand-ins** (StockSnap and
rawpixel via Openverse), served as AVIF/WebP by `next/image`. Swap in YEET's own photography before launch; see
`public/images/CREDITS.md`.

### Environment variables (all optional)

```
NEXT_PUBLIC_SITE_URL       # canonical URL for metadata
NEXT_PUBLIC_ORDER_URL      # "Order now" buttons (defaults to /menu; the product dialog shows "link coming soon")
NEXT_PUBLIC_PHONE          # shown as "Phone number TBC" until set
NEXT_PUBLIC_EMAIL          # shown as "Email TBC" until set
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
