import { PeelOfferCard, type Offer } from "@/components/PeelOfferCard";
import { FoodIconPattern } from "@/components/FoodIconPattern";

// PLACEHOLDER offers — replace with real promotions. Nothing here is a verified deal.
const OFFERS: Offer[] = [
  {
    code: "OFFER 01 · PLACEHOLDER",
    title: "Weekday combo saver",
    detail: "Sample: a burger, fries and a drink at a bundled price. Price TBA.",
    terms: "Placeholder terms: dates, availability and exclusions to be confirmed.",
  },
  {
    code: "OFFER 02 · PLACEHOLDER",
    title: "Drink on us*",
    detail: "Sample: a free drink with selected meals. Details TBA.",
    terms: "Placeholder terms: *conditions to be confirmed.",
  },
  {
    code: "OFFER 03 · PLACEHOLDER",
    title: "Share the bucket",
    detail: "Sample: a shareable fried chicken bucket with sides. Price TBA.",
    terms: "Placeholder terms: availability and portion details to be confirmed.",
  },
];

const TILTS = [-2.5, 1.5, -1];

/** Offers as oversized peelable stickers. All offer text is readable without interacting. */
export function OffersSection() {
  return (
    <section id="offers" data-surface="white" aria-labelledby="offers-title" className="surface-white relative overflow-hidden py-24 md:py-36">
      <FoodIconPattern tone="white" offset={6} />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <h2 id="offers-title" className="font-display text-[clamp(3rem,9vw,8.5rem)] uppercase leading-[0.85] text-brand">
            Peel for<br />a deal.
          </h2>
          <p className="max-w-sm font-body text-base text-ink/75">
            Lift the corner of any sticker for a bonus. Offer details are always listed on the card.
          </p>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {OFFERS.map((offer, i) => (
            <PeelOfferCard key={offer.code} offer={offer} tilt={TILTS[i % TILTS.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}
