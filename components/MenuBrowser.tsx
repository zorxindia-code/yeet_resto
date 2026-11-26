"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CATEGORIES,
  PRODUCTS,
  categoryById,
  formatPrice,
  hasPriceRange,
  isCategoryId,
  priceLabel,
  searchText,
  type CategoryId,
  type Product,
} from "@/lib/menu";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { MenuPhoto } from "@/components/MenuPhoto";
import { ScrollWaveTransition } from "@/components/ScrollWaveTransition";
import { MediaImage } from "@/components/MediaImage";
import { StickerButton } from "@/components/StickerButton";
import { useLenis } from "@/components/SmoothScrollProvider";
import { SITE } from "@/lib/site";
import { PHOTOS } from "@/lib/assets";
import { prefersReducedMotion } from "@/lib/motion";

/** Pre-computed once: the search index never changes at runtime. */
const INDEX = new Map(PRODUCTS.map((p) => [p.id, searchText(p)]));
const COUNTS = new Map<string, number>([["all", PRODUCTS.length], ...CATEGORIES.map((c) => [c.id, PRODUCTS.filter((p) => p.category === c.id).length] as [string, number])]);

/**
 * Reads ?cat= from the router. Kept in its own Suspense boundary so the rest of the menu
 * (every product, grouped by category) is prerendered into static HTML.
 */
function UrlCategorySync({ onChange }: { onChange: (c: CategoryId | null) => void }) {
  const cat = useSearchParams().get("cat");
  useLayoutEffect(() => onChange(isCategoryId(cat) ? cat : null), [cat, onChange]);
  return null;
}

/** Ingredients repeat the section line for some sections (e.g. smash burgers); cards skip them there. */
const cardDetails = (p: Product) => {
  if (p.includes) return p.includes.join(" · ");
  if (p.ingredients && !categoryById(p.category).note) return p.ingredients.join(" · ");
  return null;
};

/** `lead` marks the first card on the page so its photo loads at high priority. */
function ProductCard({ product, onOpen, lead = false }: { product: Product; onOpen: (p: Product) => void; lead?: boolean }) {
  const details = cardDetails(product);
  const tbc = product.price === null;
  return (
    <li>
      {/* The name button stretches over the whole card (::after), keeping the HTML valid:
          headings and images can't live inside a <button>. */}
      <article className="group relative flex flex-col items-center text-center md:items-stretch md:text-left" data-cursor="bite me">
        <div className="relative w-full">
          <MenuPhoto
            image={product.image}
            alt=""
            label={product.name}
            icon={product.icon}
            preload={lead}
            // Phones: photos sit straight on the page; placeholders keep their paper tile.
            className={product.image ? "md:rounded-[6px] md:bg-paper" : "rounded-[6px] bg-paper"}
            productClassName="transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-2 group-hover:scale-[1.04]"
            sizes="(min-width: 1280px) 320px, (min-width: 640px) 34vw, 40vw"
          />
          {/* The placeholder already carries the icon, so the corner sticker is only added to photos. */}
          {product.image ? (
            <FoodIcon
              name={product.icon}
              className="sticker-edge absolute -bottom-4 right-3 hidden w-11 transition-transform md:block duration-300 group-hover:-translate-y-1 group-hover:rotate-12"
            />
          ) : null}
        </div>
        <div className="mt-3 md:mt-5 md:flex md:items-baseline md:justify-between md:gap-4">
          <h3 className="font-display text-lg uppercase leading-[1.02] text-ink transition-colors group-hover:text-brand md:text-2xl md:leading-none">
            <button
              type="button"
              onClick={() => onOpen(product)}
              aria-haspopup="dialog"
              className="text-center uppercase after:absolute md:text-left after:inset-0 after:rounded-[8px] after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-brand"
            >
              {product.name}
            </button>
          </h3>
          <span className={`hidden shrink-0 font-display text-xl md:inline ${tbc ? "text-ink/80" : "text-brand"}`}>{priceLabel(product)}</span>
        </div>
        {product.description || product.portion ? (
          <p className="mt-1.5 font-body text-[13px] leading-snug text-ink/80 md:mt-2 md:text-sm md:leading-normal">
            {[product.portion, product.description].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {details ? <p className="mt-1.5 font-body text-[13px] leading-snug text-ink/80 md:mt-2 md:text-sm md:leading-normal">{details}</p> : null}
        {/* Phones: price under the description (desktop shows it beside the name). */}
        <p className={`mt-2 font-display text-lg md:hidden ${tbc ? "text-ink/80" : "text-brand"}`}>{priceLabel(product)}</p>
        {product.variants ? (
          <ul className="mt-2 flex flex-wrap justify-center gap-1.5 font-body text-xs text-ink md:mt-3 md:justify-start md:gap-2 md:text-sm" aria-label={product.variantType ?? "Options"}>
            {product.variants.map((v) => (
              <li key={v.id} className="rounded-md px-2 py-0.5 ring-1 ring-ink/15 md:px-2.5 md:py-1">
                {v.label}
                {hasPriceRange(product) ? <span className="text-brand"> · {formatPrice(v.price)}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {product.addOns?.map((a) => (
          <p key={a.id} className="mt-2 font-display text-[11px] uppercase tracking-wide text-brand md:mt-3 md:text-xs">
            + {a.label} {formatPrice(a.price)}
            {a.unit ? ` ${a.unit}` : ""}
          </p>
        ))}
      </article>
    </li>
  );
}

export function MenuBrowser() {
  const [urlCategory, setUrlCategory] = useState<CategoryId | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const lenis = useLenis();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const active: CategoryId | "all" = urlCategory ?? "all";

  const onUrlCategory = useCallback((c: CategoryId | null) => setUrlCategory(c), []);

  const selectCategory = (c: CategoryId | "all") => {
    setUrlCategory(c === "all" ? null : c);
    // Native history updates are synced with the Next.js router (and useSearchParams).
    window.history.replaceState(null, "", c === "all" ? "/menu" : `/menu?cat=${c}`);
    // If the list has scrolled under the sticky tabs, bring its top back into view.
    requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list || list.getBoundingClientRect().top > 0) return;
      const smooth = lenis?.current;
      if (smooth) smooth.scrollTo(list, { offset: -150 });
      else list.scrollIntoView();
    });
  };

  // Scroll spy for the "All" view (every category stacked): which section is under the sticky
  // tabs. A filtered view shows one category, so the filter itself is the highlight there.
  const [inView, setInView] = useState<CategoryId | null>(null);
  useEffect(() => {
    if (active !== "all") return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      // A section is current once its heading is in the upper part of the visible area below the tabs.
      const top = navRef.current?.getBoundingClientRect().bottom ?? 140;
      const line = top + (window.innerHeight - top) * 0.3;
      let current: CategoryId | null = null;
      document.querySelectorAll<HTMLElement>("section[data-menu-cat]").forEach((el) => {
        if (el.getBoundingClientRect().top <= line) current = el.dataset.menuCat as CategoryId;
      });
      setInView(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [active, query]);

  // The highlighted tab: the chosen filter, or in the "All" view the category being read.
  const highlight: CategoryId | "all" = active !== "all" ? active : (inView ?? "all");

  // Keep the highlighted tab centred in the horizontally scrolling bar (also after deep links).
  useEffect(() => {
    const nav = navRef.current;
    const btn = nav?.querySelector<HTMLElement>(`[data-cat="${highlight}"]`);
    if (!nav || !btn || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: Math.max(0, btn.offsetLeft - (nav.clientWidth - btn.offsetWidth) / 2), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [highlight]);

  const groups = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const match = (p: Product) => terms.every((t) => INDEX.get(p.id)!.includes(t));
    return CATEGORIES.filter((c) => active === "all" || c.id === active)
      .map((c) => ({ category: c, items: PRODUCTS.filter((p) => p.category === c.id && match(p)) }))
      .filter((g) => g.items.length > 0);
  }, [active, query]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  // Dialog: lock scroll, move focus in, trap Tab, close on Escape, restore focus.
  useEffect(() => {
    if (!selected) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    const smooth = lenis?.current;
    smooth?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button, a[href]");
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      smooth?.start();
      lastFocus.current?.focus?.();
    };
  }, [selected, lenis]);

  const selectedCategory = selected ? categoryById(selected.category) : null;

  return (
    <div>
      <Suspense fallback={null}>
        <UrlCategorySync onChange={onUrlCategory} />
      </Suspense>

      {/* Phones: full-bleed photo intro with the heading on its lower part. */}
      <section className="relative flex min-h-[70svh] flex-col justify-end overflow-hidden px-5 pb-16 pt-28 text-center text-white md:hidden">
        <MediaImage
          skip="(min-width: 768px)"
          data-lcp
          src={PHOTOS.mobile.menu.src}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: PHOTOS.mobile.menu.position }}
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="relative">
          <h1 className="font-display text-[clamp(3.25rem,17vw,4.5rem)] uppercase leading-[0.86]">The menu</h1>
          <p className="mx-auto mt-4 max-w-[30ch] font-body text-base">
            Smash burgers, zingers, wings, wraps, strips meals, sides and shakes. Every price in AED.
          </p>
        </div>
      </section>
      {/* Photo → white page: the same scroll wave as the homepage, phones only. */}
      <ScrollWaveTransition from="transparent" to="white" overlap="top" only="mobile" height={{ mobile: 56, desktop: 0 }} shape={1} direction="left" />

      <header className="mx-auto max-w-[1440px] px-5 pb-6 pt-6 md:px-10 md:pb-8 md:pt-36">
        <p className="hidden font-display text-sm uppercase tracking-[0.25em] text-brand md:block">All prices in AED</p>
        <div className="flex flex-col gap-8 md:mt-3 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="hidden font-display text-[clamp(3.4rem,10vw,9rem)] uppercase leading-[0.84] text-brand md:block">
            The
            <br />
            menu.
          </h1>
          <div className="w-full lg:max-w-md">
            <label htmlFor="menu-search" className="font-display text-xs uppercase tracking-wide text-ink/80 md:text-sm">
              Search the menu
            </label>
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Smash burger, wings, Oreo shake…"
              className="mt-2 w-full border-b-2 border-ink/25 bg-transparent py-3 font-body text-lg text-ink placeholder:text-ink/60 focus:border-brand focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* Sticky category navigation */}
      <div className="sticky top-[calc(env(safe-area-inset-top)+72px)] z-40 bg-white py-2 before:absolute before:inset-x-0 before:bottom-full before:h-[calc(env(safe-area-inset-top)+72px)] before:bg-white md:top-[72px] md:border-y md:border-brand/15 md:py-0 md:before:hidden">
        <nav
          ref={navRef}
          aria-label="Menu categories"
          className="relative mx-auto max-w-[1440px] overflow-x-auto px-4 max-md:[scrollbar-width:none] md:px-10 max-md:[&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex min-w-max gap-1 md:gap-6">
            {[{ id: "all" as const, name: "All", icon: null }, ...CATEGORIES].map((c) => {
              const isActive = active === c.id; // the applied filter
              const lit = highlight === c.id; // solid red tab
              // "All" stays outlined while a category below it is being read, so the filter remains visible.
              const allOutline = c.id === "all" && isActive && !lit;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-current={lit && !isActive ? "location" : undefined}
                    onClick={() => selectCategory(c.id)}
                    data-cursor="view"
                    data-cat={c.id}
                    className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 font-display text-[13px] uppercase tracking-wide transition-colors md:h-auto md:rounded-none md:border-b-[3px] md:px-0 md:py-3.5 md:text-sm ${
                      lit
                        ? "bg-brand text-white md:border-brand md:bg-transparent md:text-brand"
                        : allOutline
                          ? "text-brand ring-1 ring-inset ring-brand md:border-brand/30 md:ring-0"
                          : "text-ink/80 hover:text-brand md:border-transparent"
                    }`}
                  >
                    {c.icon ? <FoodIcon name={c.icon} className="hidden h-7 w-7 md:block" /> : null}
                    {c.name}
                    <span className="md:hidden">({COUNTS.get(c.id)})</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div ref={listRef} className="mx-auto max-w-[1440px] px-5 pb-20 pt-6 md:px-10 md:pb-28 md:pt-14">
        <p className="text-center font-body text-sm text-ink/80 md:text-left" aria-live="polite">
          Showing {total} {total === 1 ? "item" : "items"}
        </p>

        {groups.length ? (
          groups.map(({ category, items }, gi) => (
            <section key={category.id} id={`menu-${category.id}`} data-menu-cat={category.id} aria-labelledby={`menu-${category.id}-title`} className="mt-14 first:mt-6 md:mt-12 md:first:mt-8">
              <div className="flex flex-col items-center gap-2 text-center md:flex-row md:items-end md:justify-between md:gap-6 md:border-b-2 md:border-brand md:pb-3 md:text-left">
                <h2 id={`menu-${category.id}-title`} className="font-display text-[clamp(2rem,4vw,3.25rem)] uppercase leading-none text-brand">
                  {category.name}
                </h2>
                <p className={`max-w-[34ch] font-body text-[13px] text-ink/80 md:max-w-md md:text-right md:text-sm ${category.note ? "" : "hidden md:block"}`}>
                  {category.note ?? category.blurb}
                </p>
              </div>
              <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-8 md:gap-x-8 md:gap-y-14 xl:grid-cols-3">
                {items.map((p, ii) => (
                  <ProductCard key={p.id} product={p} onOpen={setSelected} lead={gi === 0 && ii === 0} />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <div className="mt-10 border-2 border-dashed border-brand/30 p-10 text-center">
            <p className="font-display text-3xl uppercase text-brand">Nothing matched</p>
            <p className="mt-2 font-body text-ink/80">Try another search or pick a different section.</p>
          </div>
        )}
      </div>

      {selected && selectedCategory ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/60 md:items-center md:p-6"
          onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-title"
            className="relative max-h-[92svh] w-full overflow-y-auto bg-white p-5 shadow-2xl [border-radius:28px_28px_0_0] md:max-w-3xl md:p-8 md:[border-radius:20px]"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close product details"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-8">
              <MenuPhoto
                image={selected.image}
                alt={selected.name}
                label={selected.name}
                icon={selected.icon}
                ratio={1}
                fit={0.82}
                maxScale={1.3}
                className="rounded-[6px] bg-paper"
                sizes="(min-width: 768px) 340px, 80vw"
              />
              <div>
                <p className="font-display text-xs uppercase tracking-[0.2em] text-brand">{selectedCategory.name}</p>
                <h2 id="product-title" className="mt-2 pr-12 font-display text-4xl uppercase leading-none text-ink md:text-5xl">
                  {selected.name}
                </h2>
                {selected.description ? <p className="mt-4 font-body text-base text-ink/80">{selected.description}</p> : null}

                {selected.variants ? (
                  <div className="mt-5">
                    <p className="font-display text-sm uppercase tracking-wide text-ink/80">{selected.variantType ?? "Options"}</p>
                    <ul className="mt-2 divide-y divide-ink/10 border-y border-ink/10">
                      {selected.variants.map((v) => (
                        <li key={v.id} className="flex items-baseline justify-between gap-4 py-2.5">
                          <span className="font-display text-lg uppercase text-ink">{v.label}</span>
                          <span className="font-display text-xl text-brand">{formatPrice(v.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-display uppercase">
                    <span className={`text-3xl ${selected.price === null ? "text-ink" : "text-brand"}`}>{priceLabel(selected)}</span>
                    {selected.portion ? <span className="text-base text-ink/80">{selected.portion}</span> : null}
                  </p>
                )}
                {selected.price === null ? (
                  <p className="mt-2 font-body text-sm text-ink/80">The price for this item is being confirmed.</p>
                ) : null}

                {selected.addOns?.length ? (
                  <ul className="mt-4 font-body text-sm text-ink">
                    {selected.addOns.map((a) => (
                      <li key={a.id}>
                        <span className="font-display uppercase text-brand">+ {a.label}</span> {formatPrice(a.price)}
                        {a.unit ? ` ${a.unit}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-body text-sm">
                  {selected.includes ? (
                    <>
                      <dt className="font-display uppercase text-ink/80">Includes</dt>
                      <dd className="text-ink">{selected.includes.join(", ")}</dd>
                    </>
                  ) : null}
                  {selected.ingredients ? (
                    <>
                      <dt className="font-display uppercase text-ink/80">Ingredients</dt>
                      <dd className="text-ink">{selected.ingredients.join(", ")}</dd>
                    </>
                  ) : null}
                  <dt className="font-display uppercase text-ink/80">Dietary</dt>
                  <dd className="text-ink/80">To be confirmed</dd>
                  <dt className="font-display uppercase text-ink/80">Allergens</dt>
                  <dd className="text-ink/80">To be confirmed</dd>
                </dl>
                <div className="mt-7">
                  {/* Until an ordering link is configured, "Order" would only reload this page. */}
                  {SITE.orderConfigured ? (
                    <StickerButton href={SITE.orderUrl} surface="white" cursor="BITE ME" onClick={() => setSelected(null)}>
                      Order this
                    </StickerButton>
                  ) : (
                    <p className="font-body text-sm text-ink/80">Online ordering link coming soon.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
