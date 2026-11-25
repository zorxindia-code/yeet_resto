"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AVAILABILITY_LABEL,
  CATEGORIES,
  PRODUCTS,
  categoryById,
  formatPrice,
  isCategoryId,
  type CategoryId,
  type Product,
} from "@/lib/menu";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { Photo } from "@/components/Photo";
import { SpiceMeter } from "@/components/SpiceMeter";
import { StickerButton } from "@/components/StickerButton";
import { useLenis } from "@/components/SmoothScrollProvider";
import { SITE } from "@/lib/site";

type Filter = "all" | "bestseller" | "spicy" | "available";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "bestseller", label: "Bestsellers" },
  { id: "spicy", label: "Spicy" },
  { id: "available", label: "Available now" },
];

/**
 * Reads ?cat= from the router. Kept in its own Suspense boundary so the rest of the menu
 * (every product, grouped by category) is prerendered into static HTML.
 */
function UrlCategorySync({ onChange }: { onChange: (c: CategoryId | null) => void }) {
  const cat = useSearchParams().get("cat");
  useLayoutEffect(() => onChange(isCategoryId(cat) ? cat : null), [cat, onChange]);
  return null;
}

/** `lead` marks the first card on the page: its photo is the mobile LCP, so it is preloaded. */
function ProductCard({ product, onOpen, lead = false }: { product: Product; onOpen: (p: Product) => void; lead?: boolean }) {
  const soldOut = product.availability === "sold-out";
  return (
    <li>
      {/* The name button stretches over the whole card (::after), keeping the HTML valid:
          headings and images can't live inside a <button>. */}
      <article className="group relative flex flex-col" data-cursor={soldOut ? "view" : "bite me"}>
        <div className="relative">
          <Photo
            src={product.image}
            alt=""
            ratio="4 / 3"
            preload={lead}
            className="rounded-[6px]"
            imgClassName={`transition-transform duration-700 ease-out group-hover:scale-[1.05] ${soldOut ? "grayscale" : ""}`}
            sizes="(min-width: 1280px) 400px, (min-width: 640px) 46vw, 92vw"
          />
          {product.bestseller ? (
            <span className="sticker-label die-cut absolute left-3 top-3 -rotate-6 bg-brand px-2.5 py-1 text-xs text-white">Bestseller</span>
          ) : null}
          {soldOut ? (
            <span className="sticker-label absolute right-3 top-3 rotate-3 bg-ink px-2.5 py-1 text-xs text-white [border-radius:8px_3px_7px_4px]">
              Sold out
            </span>
          ) : null}
          <FoodIcon name={product.icon} className="sticker-edge absolute -bottom-4 right-3 w-11 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-12" />
        </div>
        <div className="mt-5 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-2xl uppercase leading-none text-ink transition-colors group-hover:text-brand">
            <button
              type="button"
              onClick={() => onOpen(product)}
              aria-haspopup="dialog"
              className="text-left uppercase after:absolute after:inset-0 after:rounded-[8px] after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-brand"
            >
              {product.name}
            </button>
          </h3>
          <span className="shrink-0 font-display text-xl text-brand">{formatPrice(product.price)}</span>
        </div>
        <p className="mt-2 font-body text-sm text-ink/80">{product.description}</p>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-xs uppercase tracking-wide text-ink/80">
          <SpiceMeter level={product.spicy} />
          {product.availability === "limited" ? <span className="text-brand">{AVAILABILITY_LABEL.limited}</span> : null}
          {soldOut ? <span className="text-ink">{AVAILABILITY_LABEL["sold-out"]}</span> : null}
        </p>
      </article>
    </li>
  );
}

export function MenuBrowser() {
  const [urlCategory, setUrlCategory] = useState<CategoryId | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Product | null>(null);
  const lenis = useLenis();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const active: CategoryId | "all" = urlCategory ?? "all";

  const onUrlCategory = useCallback((c: CategoryId | null) => setUrlCategory(c), []);

  const selectCategory = (c: CategoryId | "all") => {
    setUrlCategory(c === "all" ? null : c);
    // Native history updates are synced with the Next.js router (and useSearchParams).
    window.history.replaceState(null, "", c === "all" ? "/menu" : `/menu?cat=${c}`);
  };

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (p: Product) =>
      (filter !== "bestseller" || p.bestseller) &&
      (filter !== "spicy" || p.spicy > 0) &&
      (filter !== "available" || p.availability !== "sold-out") &&
      (!q || `${p.name} ${p.description}`.toLowerCase().includes(q));
    return CATEGORIES.filter((c) => active === "all" || c.id === active)
      .map((c) => ({ category: c, items: PRODUCTS.filter((p) => p.category === c.id && match(p)) }))
      .filter((g) => g.items.length > 0);
  }, [active, query, filter]);

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

  return (
    <div>
      <Suspense fallback={null}>
        <UrlCategorySync onChange={onUrlCategory} />
      </Suspense>

      <header className="mx-auto max-w-[1440px] px-5 pb-8 pt-32 md:px-10 md:pt-36">
        <p className="font-display text-sm uppercase tracking-[0.25em] text-brand">Demo menu · sample prices</p>
        <div className="mt-3 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="font-display text-[clamp(3.4rem,10vw,9rem)] uppercase leading-[0.84] text-brand">
            The
            <br />
            menu.
          </h1>
          <div className="w-full lg:max-w-md">
            <label htmlFor="menu-search" className="font-display text-sm uppercase tracking-wide text-ink/80">
              Search the menu
            </label>
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Burgers, wings, milkshake…"
              className="mt-2 w-full border-b-2 border-ink/25 bg-transparent py-3 font-body text-lg text-ink placeholder:text-ink/60 focus:border-brand focus:outline-none"
            />
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter items">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-md px-3 py-1.5 font-body text-sm transition-colors ${
                    filter === f.id ? "bg-ink text-white" : "text-ink/80 ring-1 ring-ink/20 hover:ring-ink/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Sticky category navigation */}
      <div className="sticky top-[72px] z-40 border-y border-brand/15 bg-white">
        <nav aria-label="Menu categories" className="mx-auto max-w-[1440px] overflow-x-auto px-5 md:px-10">
          <ul className="flex min-w-max gap-6">
            {[{ id: "all" as const, name: "All", icon: null }, ...CATEGORIES].map((c) => {
              const isActive = active === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => selectCategory(c.id)}
                    data-cursor="view"
                    className={`flex items-center gap-2 border-b-[3px] py-3.5 font-display text-sm uppercase tracking-wide transition-colors ${
                      isActive ? "border-brand text-brand" : "border-transparent text-ink/80 hover:text-brand"
                    }`}
                  >
                    {c.icon ? <FoodIcon name={c.icon} className="h-7 w-7" /> : null}
                    {c.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 pb-28 pt-10 md:px-10 md:pt-14">
        <p className="font-body text-sm text-ink/80" aria-live="polite">
          Showing {total} {total === 1 ? "item" : "items"}
        </p>

        {groups.length ? (
          groups.map(({ category, items }, gi) => (
            <section key={category.id} id={`menu-${category.id}`} aria-labelledby={`menu-${category.id}-title`} className="mt-12 first:mt-8">
              <div className="flex items-end justify-between gap-6 border-b-2 border-brand pb-3">
                <h2 id={`menu-${category.id}-title`} className="font-display text-[clamp(2rem,4vw,3.25rem)] uppercase leading-none text-brand">
                  {category.name}
                </h2>
                <p className="hidden font-body text-sm text-ink/80 sm:block">{category.blurb}</p>
              </div>
              <ul className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((p, ii) => (
                  <ProductCard key={p.id} product={p} onOpen={setSelected} lead={gi === 0 && ii === 0} />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <div className="mt-10 border-2 border-dashed border-brand/30 p-10 text-center">
            <p className="font-display text-3xl uppercase text-brand">Nothing matched</p>
            <p className="mt-2 font-body text-ink/80">Try another search or clear the filters.</p>
          </div>
        )}
      </div>

      {selected ? (
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
              <Photo
                src={selected.image}
                alt={selected.name}
                ratio="4 / 5"
                className="rounded-[6px]"
                imgClassName={selected.availability === "sold-out" ? "grayscale" : ""}
                sizes="(min-width: 768px) 360px, 92vw"
              />
              <div>
                <p className="font-display text-xs uppercase tracking-[0.2em] text-brand">{categoryById(selected.category).name}</p>
                <h2 id="product-title" className="mt-2 font-display text-4xl uppercase leading-none text-ink md:text-5xl">
                  {selected.name}
                </h2>
                <p className="mt-4 font-body text-base text-ink/80">{selected.description}</p>
                <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-display uppercase">
                  <span className="text-3xl text-brand">{formatPrice(selected.price)}</span>
                  <span className="text-sm text-ink/80">
                    <SpiceMeter level={selected.spicy} />
                  </span>
                </p>
                <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-body text-sm">
                  <dt className="font-display uppercase text-ink/80">Status</dt>
                  <dd className={selected.availability === "sold-out" ? "text-ink" : "text-brand"}>{AVAILABILITY_LABEL[selected.availability]}</dd>
                  <dt className="font-display uppercase text-ink/80">Dietary</dt>
                  <dd className="text-ink/80">To be confirmed</dd>
                  <dt className="font-display uppercase text-ink/80">Allergens</dt>
                  <dd className="text-ink/80">To be confirmed</dd>
                </dl>
                <p className="mt-4 font-body text-xs text-ink/70">Demo item: name, price and availability are sample data.</p>
                <div className="mt-7">
                  {selected.availability === "sold-out" ? (
                    <p className="font-display text-lg uppercase text-ink">Back soon</p>
                  ) : (
                    <StickerButton href={SITE.orderUrl} surface="white" cursor="BITE ME" onClick={() => setSelected(null)}>
                      Order this
                    </StickerButton>
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
