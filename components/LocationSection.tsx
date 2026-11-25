import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import { StickerButton } from "@/components/StickerButton";

const isExternal = (href: string) => /^https?:\/\//.test(href);

function Info({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_26px_-22px_rgba(221,3,3,0.55)] ring-1 ring-brand/10">
      <h3 className="font-display text-sm uppercase tracking-[0.2em] text-brand">{title}</h3>
      <div className="mt-3 font-body text-lg text-ink">{children}</div>
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <StickerButton href={href} variant="secondary" surface="white" cursor="EXPLORE" className="text-base">
      {children}
      {isExternal(href) ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </StickerButton>
  );
}

/** Location, contact and ordering. All business details are placeholders. */
export function LocationSection() {
  return (
    <section id="contact" data-surface="white" aria-labelledby="contact-title" className="surface-white relative overflow-hidden py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <h2 id="contact-title" className="font-display text-[clamp(3rem,9vw,8.5rem)] uppercase leading-[0.85] text-brand">
          Your next bite<br />is here.
        </h2>
        <p className="mt-5 max-w-md font-body text-sm text-ink/60">
          Placeholder details below. Add the real address, hours and links to lib/site.ts or the NEXT_PUBLIC_* environment variables.
        </p>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <Info title="Address">{SITE.address}</Info>
            <Info title="Opening hours">{SITE.hours}</Info>
            <Info title="Contact">
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="underline underline-offset-4" data-cursor="explore">{SITE.phone}</a>
              <br />
              <a href={`mailto:${SITE.email}`} className="underline underline-offset-4" data-cursor="explore">{SITE.email}</a>
            </Info>
            <Info title="Services">
              <ul className="flex flex-wrap gap-2 pt-1 font-body text-sm">
                {["Dine-in", "Takeaway", "Delivery"].map((s) => (
                  <li key={s} className="rounded-full border border-brand/30 px-3 py-1 text-brand">
                    {s} <span className="text-ink/50">· TBC</span>
                  </li>
                ))}
              </ul>
            </Info>
          </div>

          <div className="lg:col-span-7">
            <div className="relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-[36px] bg-paper p-8 text-center ring-1 ring-brand/15 md:min-h-[460px]" role="img" aria-label="Map placeholder. Replace with an embedded map.">
              <div aria-hidden="true" className="absolute inset-4 rounded-[28px] border-2 border-dashed border-brand/25" />
              <svg viewBox="0 0 24 24" aria-hidden="true" className="relative h-12 w-12 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              <p className="relative mt-4 font-display text-2xl uppercase text-brand">Map embed placeholder</p>
              <p className="relative mt-2 max-w-xs font-body text-sm text-ink/70">Google Maps embed goes here once the address is confirmed.</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <ExtLink href={SITE.mapsUrl}>Google Maps</ExtLink>
              <ExtLink href={SITE.directionsUrl}>Directions</ExtLink>
              <ExtLink href={SITE.whatsappUrl}>WhatsApp</ExtLink>
              <StickerButton href={SITE.orderUrl} surface="white" className="text-base">Order now</StickerButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
