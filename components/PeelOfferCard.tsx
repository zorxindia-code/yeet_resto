"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE } from "@/lib/site";

export type Offer = { code: string; title: string; detail: string; terms: string };

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
// Geometry (as fractions of the card): the fold runs from (100%, 20%) to (20%, 100%).
// Everything beyond the fold is exposed; the curl band sits just inside it, like a
// rolled-back corner. Polygons keep equal point counts so clip-path can transition.
const FRONT_FLAT = "polygon(0 0, 100% 0, 100% 100%, 100% 100%, 0 100%)";
const FRONT_PEELED = "polygon(0 0, 100% 0, 100% 20%, 20% 100%, 0 100%)";
const CURL_FLAT = "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)";
const CURL_PEELED = "polygon(100% 4%, 100% 20%, 20% 100%, 4% 100%)";

/**
 * Oversized peelable offer sticker. The offer text is always readable on the front and is
 * width-limited so the curl never covers it; peeling (click, Enter or Space on the corner)
 * reveals a bonus action that fits entirely inside the exposed corner.
 */
export function PeelOfferCard({ offer, tilt }: { offer: Offer; tilt: number }) {
  const [peeled, setPeeled] = useState(false);
  const backId = `offer-${offer.code.replace(/\W+/g, "-").toLowerCase()}-back`;

  return (
    <article className="relative" style={{ transform: `rotate(${tilt}deg)` }}>
      <div className="relative min-h-[360px] overflow-hidden rounded-[40px] bg-white shadow-[0_30px_40px_-26px_rgba(0,0,0,0.6)] ring-[10px] ring-white">
        {/* Under the corner: adhesive backing with the bonus, confined to the exposed triangle */}
        <div id={backId} aria-hidden={!peeled} className="paper-texture absolute inset-0 bg-[#f6f2f1]">
          <div className="absolute bottom-0 right-0 flex h-[40%] w-[40%] flex-col items-end gap-1 p-4 pb-14 text-right">
            <p className="font-display text-[10px] uppercase tracking-[0.2em] text-brand">Bonus</p>
            <p className="font-display text-xl uppercase leading-none text-brand">Ready?</p>
            <Link
              href={SITE.orderUrl}
              tabIndex={peeled ? 0 : -1}
              data-cursor="BITE ME"
              className="sticker-cta sticker-label mt-1 inline-flex bg-brand px-3 py-1.5 text-xs text-white"
            >
              Order now
            </Link>
          </div>
        </div>

        {/* Front sticker */}
        <div
          className="absolute inset-0 flex flex-col bg-brand p-7 text-white"
          style={{ clipPath: peeled ? FRONT_PEELED : FRONT_FLAT, transition: `clip-path 700ms ${EASE}` }}
        >
          <p className="font-display text-xs uppercase tracking-[0.2em] text-white/85">{offer.code}</p>
          <h3 className="mt-3 max-w-[12ch] font-display text-4xl uppercase leading-[0.9] md:text-5xl">{offer.title}</h3>
          {/* Kept in the upper-left so the fold never covers offer text, peeled or not */}
          <p className="mt-4 max-w-[58%] font-body text-base text-white/90">{offer.detail}</p>
          <p className="mt-3 max-w-[58%] font-body text-xs text-white/75">{offer.terms}</p>
        </div>

        {/* The lifted corner, rolled back over the sticker, casting a soft shadow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ filter: "drop-shadow(-6px -6px 8px rgba(0,0,0,0.22))" }}>
          <div
            className="absolute inset-0"
            style={{
              clipPath: peeled ? CURL_PEELED : CURL_FLAT,
              transition: `clip-path 700ms ${EASE}`,
              background: "linear-gradient(135deg, #ffffff 0%, #efebea 35%, #ffffff 58%, #d9d3d1 100%)",
            }}
          />
        </div>

        {/* Corner tab: the toggle */}
        <button
          type="button"
          aria-expanded={peeled}
          aria-controls={backId}
          onClick={() => setPeeled((v) => !v)}
          data-cursor="peel"
          className="group absolute bottom-0 right-0 z-10 flex h-16 w-16 items-end justify-end rounded-br-[30px]"
        >
          <span className="sr-only">{peeled ? "Stick the corner back down" : "Peel the corner for a bonus"}</span>
          <span
            aria-hidden="true"
            className={`absolute bottom-0 right-0 h-full w-full transition-transform duration-300 ease-out ${
              peeled ? "scale-0" : "scale-100 group-hover:scale-[1.3] group-focus-visible:scale-[1.3]"
            }`}
            style={{
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
              transformOrigin: "bottom right",
              background: "linear-gradient(135deg, #d9d3d1 0%, #ffffff 55%, #f1eeed 100%)",
            }}
          />
          <span aria-hidden="true" className="relative mb-2.5 mr-3 font-display text-[10px] uppercase tracking-wide text-brand">
            {peeled ? "Stick" : "Peel"}
          </span>
        </button>
      </div>
    </article>
  );
}
