"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, PRODUCTS, type CategoryId, type Product } from "@/lib/menu";
import { FoodIcon } from "@/components/icons/FoodIcons";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { PHOTOS } from "@/lib/assets";
import { useLenis } from "@/components/SmoothScrollProvider";
import { StickerButton } from "@/components/StickerButton";
import { SITE } from "@/lib/site";

type Filter = "all" | "bestseller" | "spicy";

function Heat({ level }: { level?: number }) {
  if (!level) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 font-display text-xs uppercase tracking-wide text-brand" aria-label={`Spicy level ${level} of 3`}>
      Spicy
      <span aria-hidden="true" className="flex gap-0.5">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-2 w-2 rounded-full ${n <= level ? "bg-brand" : "bg-brand/25"}`} />
        ))}
      </span>
    </span>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  const cat = CATEGORIES.find((c) => c.id === product.category);
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(product)}
        data-cursor="bite me"
        className="group relative flex h-full w-full flex-col rounded-[28px] bg-white p-3 text-left shadow-[0_18px_26px_-22px_rgba(221,3,3,0.5)] ring-1 ring-brand/10 transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:-rotate-[0.6deg] focus-visible:-translate-y-1.5"
      >
        {product.bestseller ? (
          <span className="sticker-label absolute -right-2 -top-3 z-10 rotate-[8deg] rounded-full bg-brand px-3 py-1.5 text-xs text-white ring-4 ring-white">
            Bestseller
          </span>
        ) : null}
        <div className="relative overflow-hidden rounded-[20px]">
          <PhotoPlaceholder src={PHOTOS.products[product.id]} alt={product.name} label={`${product.name}: product photo`} ratio="4 / 3" className="w-full transition-transform duration-700 group-hover:scale-[1.04]" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" />
          <FoodIcon name={product.icon} className="sticker-edge absolute bottom-2 left-2 w-12 text-brand" />
        </div>
        <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-brand">{cat?.name}</p>
          <h3 className="mt-1 font-display text-2xl uppercase leading-none text-ink">{product.name}</h3>
          <p className="mt-2 flex-1 font-body text-sm text-ink/70">{product.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-display text-base text-brand">{product.price ?? "PRICE TBA"}</span>
            <Heat level={product.spicy} />
          </div>
        </div>
      </button>
    </li>
  );
}

export function MenuBrowser({ initialCategory }: { initialCategory: CategoryId | "all" }) {
  const [active, setActive] = useState<CategoryId | "all">(initialCategory);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Product | null>(null);
  const lenis = useLenis();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (active !== "all" && p.category !== active) return false;
      if (filter === "bestseller" && !p.bestseller) return false;
      if (filter === "spicy" && !p.spicy) return false;
      if (q && !`${p.name} ${p.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [active, query, filter]);

  const current = CATEGORIES.find((c) => c.id === active);

  // Modal: lock scroll, focus management, Escape to close.
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
      {/* Sticky category navigation */}
      <div className="sticky top-[72px] z-40 border-b border-brand/10 bg-white/95 backdrop-blur-sm">
        <nav aria-label="Menu categories" className="mx-auto max-w-[1440px] overflow-x-auto px-5 md:px-10">
          <ul className="flex min-w-max gap-2 py-3">
            <li>
              <CategoryTab label="All" active={active === "all"} onClick={() => setActive("all")} />
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <CategoryTab
                  label={c.name}
                  icon={c.icon}
                  active={active === c.id}
                  onClick={() => setActive(c.id)}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <section className="mx-auto max-w-[1440px] px-5 pb-28 pt-10 md:px-10 md:pt-14">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.25em] text-brand">Sample menu</p>
            <h1 className="mt-2 font-display text-[clamp(3.2rem,9vw,8rem)] uppercase leading-[0.85] text-brand">
              {current && active !== "all" ? current.name : "The menu."}
            </h1>
            <p className="mt-4 max-w-md font-body text-base text-ink/75">
              {current && active !== "all" ? current.blurb : "Every item below is a placeholder. Names, descriptions, prices and dietary info are not real yet."}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[360px]">
            <label className="sr-only" htmlFor="menu-search">Search the menu</label>
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search burgers, wings, juice…"
              className="w-full rounded-full border-2 border-brand/20 bg-white px-5 py-3.5 font-body text-base text-ink placeholder:text-ink/45 focus:border-brand focus:outline-none"
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter items">
              <Chip label="All items" pressed={filter === "all"} onClick={() => setFilter("all")} />
              <Chip label="Bestsellers" pressed={filter === "bestseller"} onClick={() => setFilter("bestseller")} />
              <Chip label="Spicy" pressed={filter === "spicy"} onClick={() => setFilter("spicy")} />
            </div>
          </div>
        </header>

        <p className="mb-6 font-body text-sm text-ink/60" aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? "item" : "items"}
        </p>

        {visible.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={setSelected} />
            ))}
          </ul>
        ) : (
          <div className="rounded-[28px] border-2 border-dashed border-brand/30 p-10 text-center">
            <p className="font-display text-3xl uppercase text-brand">Nothing matched</p>
            <p className="mt-2 font-body text-ink/70">Try another search or clear the filters.</p>
          </div>
        )}
      </section>

      {selected ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/60 p-0 md:items-center md:p-6" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-title"
            className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-[32px] bg-white p-6 shadow-2xl md:max-w-2xl md:rounded-[36px] md:p-8"
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

            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <PhotoPlaceholder src={PHOTOS.products[selected.id]} alt={selected.name} label={`${selected.name}: product photo`} ratio="4 / 5" className="w-full rounded-[24px]" sizes="(min-width: 768px) 40vw, 90vw" />
              <div>
                <p className="font-display text-xs uppercase tracking-[0.2em] text-brand">{CATEGORIES.find((c) => c.id === selected.category)?.name}</p>
                <h2 id="product-title" className="mt-2 font-display text-4xl uppercase leading-none text-ink md:text-5xl">{selected.name}</h2>
                <p className="mt-4 font-body text-base text-ink/80">{selected.description}</p>
                <p className="mt-4 font-display text-2xl text-brand">{selected.price ?? "PRICE TBA"}</p>

                <dl className="mt-6 space-y-3 font-body text-sm">
                  <div>
                    <dt className="font-display uppercase tracking-wide text-ink/60">Dietary</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {selected.dietary.map((d) => (
                        <span key={d} className="rounded-full border border-ink/15 px-3 py-1 text-ink/70">{d}</span>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-display uppercase tracking-wide text-ink/60">Heat & badges</dt>
                    <dd className="mt-1 flex flex-wrap gap-2 text-ink/70">
                      {selected.spicy ? <Heat level={selected.spicy} /> : <span>Not spicy</span>}
                      {selected.bestseller ? <span className="rounded-full bg-brand px-3 py-1 text-white">Bestseller</span> : null}
                    </dd>
                  </div>
                </dl>

                <div className="mt-8">
                  <StickerButton href={SITE.orderUrl} surface="white" cursor="BITE ME" onClick={() => setSelected(null)}>
                    Order this
                  </StickerButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CategoryTab({ label, icon, active, onClick }: { label: string; icon?: Parameters<typeof FoodIcon>[0]["name"]; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`sticker-label flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
        active ? "bg-brand text-white" : "bg-paper text-brand hover:bg-brand/10"
      }`}
      data-cursor="view"
    >
      {icon ? <FoodIcon name={icon} className="h-7 w-7" /> : null}
      {label}
    </button>
  );
}

function Chip({ label, pressed, onClick }: { label: string; pressed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`rounded-full px-4 py-2 font-body text-sm transition-colors ${pressed ? "bg-ink text-white" : "border border-ink/20 text-ink/75 hover:border-ink/50"}`}
    >
      {label}
    </button>
  );
}
