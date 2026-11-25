import type { ReactNode } from "react";
import Image from "next/image";
import { PHOTOS } from "@/lib/assets";
import { SITE } from "@/lib/site";
import { StickerButton } from "@/components/StickerButton";
import { PendingLink } from "@/components/PendingLink";

const isExternal = (href: string) => /^https?:\/\//.test(href);

function Info({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2 border-t-2 border-brand/15 py-6 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
      <h3 className="font-display text-sm uppercase tracking-[0.2em] text-brand">{title}</h3>
      <div className="font-body text-lg text-ink">{children}</div>
    </div>
  );
}

function ExtLink({ href, children }: { href: string | null; children: ReactNode }) {
  return (
    <StickerButton href={href} variant="secondary" surface="white" cursor="EXPLORE" className="text-base">
      {children}
      {href && isExternal(href) ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </StickerButton>
  );
}

/** Phone and email: links when supplied, otherwise "TBC" text. */
const Phone = ({ className = "" }: { className?: string }) =>
  SITE.phone ? <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className={`underline underline-offset-4 ${className}`}>{SITE.phone}</a> : <span>Phone number TBC</span>;
const Email = ({ className = "" }: { className?: string }) =>
  SITE.email ? <a href={`mailto:${SITE.email}`} className={`underline underline-offset-4 ${className}`}>{SITE.email}</a> : <span>Email TBC</span>;

const iconProps = { viewBox: "0 0 24 24", "aria-hidden": true, className: "mt-0.5 h-5 w-5 shrink-0 text-brand", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const PinIcon = () => (
  <svg {...iconProps}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
const ClockIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...iconProps}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);

/** Location, contact and ordering. All business details are placeholders. */
export function LocationSection() {
  return (
    <section id="contact" data-surface="white" aria-labelledby="contact-title" className="surface-white relative overflow-hidden pb-16 pt-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <h2 id="contact-title" className="font-display text-[clamp(2.4rem,11vw,3.2rem)] uppercase leading-[0.85] text-brand md:text-[clamp(3rem,9vw,8.5rem)]">
          <span className="md:hidden">Our location</span>
          <span className="hidden md:inline">
            Your next bite<br />is here.
          </span>
        </h2>
        <p className="mt-5 max-w-md font-body text-sm text-ink/60">
          Placeholder details below. Add the real address, hours and links to lib/site.ts or the NEXT_PUBLIC_* environment variables.
        </p>

        {/* Phones: one stacked block per branch. Only one (unconfirmed) branch exists so far. */}
        <article className="mt-8 md:hidden" aria-labelledby="branch-main">
          <div className="relative aspect-[4/3] overflow-hidden bg-paper">
            <Image src={PHOTOS.mobile.branch.src} alt={PHOTOS.mobile.branch.alt} fill sizes="(min-width: 768px) 1px, 92vw" className="object-cover" />
            <span className="absolute left-3 top-3 bg-white px-2 py-1 font-body text-[11px] text-ink/80">Photo TBC</span>
          </div>
          <h3 id="branch-main" className="mt-6 font-display text-[2rem] uppercase leading-none text-ink">Branch name TBC</h3>
          <ul className="mt-4 space-y-3 font-body text-base text-ink">
            <li className="flex gap-3">
              <PinIcon />
              <span>{SITE.address}</span>
            </li>
            <li className="flex gap-3">
              <ClockIcon />
              <span>{SITE.hours}</span>
            </li>
            <li className="flex gap-3">
              <PhoneIcon />
              <Phone />
            </li>
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            <a href={SITE.orderUrl} className="flex h-12 items-center justify-center rounded-full bg-brand font-display text-sm uppercase tracking-wide text-white">
              Order from here
            </a>
            <PendingLink href={SITE.directionsUrl} className="flex h-12 items-center justify-center rounded-full font-display text-sm uppercase tracking-wide text-ink ring-1 ring-ink/30">
              Get directions
            </PendingLink>
          </div>
          <p className="mt-5 font-body text-sm text-ink/80">
            <PendingLink href={SITE.whatsappUrl} className="underline underline-offset-4">WhatsApp</PendingLink>
            <span aria-hidden="true"> · </span>
            <Email />
            <span aria-hidden="true"> · </span>
            <PendingLink href={SITE.mapsUrl} className="underline underline-offset-4">Google Maps</PendingLink>
          </p>
        </article>

        <div className="mt-14 hidden grid-cols-[minmax(0,1fr)] gap-10 md:grid lg:grid-cols-12 lg:gap-14">
          <div className="border-b-2 border-brand/15 lg:col-span-5">
            <Info title="Address">{SITE.address}</Info>
            <Info title="Opening hours">{SITE.hours}</Info>
            <Info title="Contact">
              <Phone />
              <br />
              <Email />
            </Info>
            <Info title="Services">
              <ul className="flex flex-wrap gap-x-5 gap-y-1 font-body text-lg">
                {["Dine-in", "Takeaway", "Delivery"].map((s) => (
                  <li key={s} className="text-ink">
                    {s} <span className="text-ink/70">· TBC</span>
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
