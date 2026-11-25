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
| `/menu` | Menu browser: sticky category tabs, search, filters, product detail dialog. Deep links: `/menu?cat=burgers` (`chicken`, `pizza`, `sides`, `popcorn`, `drinks`) |

## Replacing placeholders

Everything marked *placeholder* on the site is meant to be swapped. None of it changes animation code.

| What | Where |
| ---- | ----- |
| Food, lifestyle and gallery photos | Put files in `public/images/…`, then set paths in `lib/assets.ts`. Each `PhotoPlaceholder` renders the real photo once its slot has a path. |
| Address, hours, phone, email, order/maps/WhatsApp/social links | `lib/site.ts`, or the `NEXT_PUBLIC_*` env vars it reads |
| Menu items, prices, dietary info | `lib/menu.ts` (`price: null` shows "PRICE TBA") |
| Offers | `components/OffersSection.tsx` |
| Brand story copy | `components/BrandExperience.tsx` |
| Burger ingredient layers | `components/BurgerAssembly.tsx` (`LAYERS`, bottom → top) |
| Takeaway bag artwork | `components/TakeawayBagExperience.tsx` (`TakeawayBag`) |

### Environment variables (all optional)

```
NEXT_PUBLIC_SITE_URL       # canonical URL for metadata
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
# yeet_resto
