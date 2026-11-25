import type { CSSProperties, ReactNode } from "react";

/**
 * YEET custom food icon system.
 * Every icon is drawn in the same two-pass sticker treatment:
 *  pass 1 — thick white die-cut halo
 *  pass 2 — red line art on white with minimal red fills
 * 64×64 viewBox, consistent stroke weights, rounded joins.
 */

export const BRAND_RED = "#DD0303";
const WHITE = "#FFFFFF";

type Pass = { stroke: string; sw: number; accent: string; fill: string };

function Art({ draw }: { draw: (p: Pass) => ReactNode }) {
  return (
    <g>
      {draw({ stroke: WHITE, sw: 9, accent: WHITE, fill: WHITE })}
      {draw({ stroke: BRAND_RED, sw: 3, accent: BRAND_RED, fill: WHITE })}
    </g>
  );
}

const S = (p: Pass) => ({
  stroke: p.stroke,
  strokeWidth: p.sw,
  fill: p.fill,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
});
const LINE = (p: Pass) => ({ ...S(p), fill: "none" });

const ICONS = {
  burger: () => (
    <Art draw={(p) => (
      <>
        <path d="M11 29 C11 15 21 9 32 9 C43 9 53 15 53 29 Z" {...S(p)} />
        <circle cx="23" cy="18" r="1.8" fill={p.accent} stroke="none" />
        <circle cx="32" cy="14" r="1.8" fill={p.accent} stroke="none" />
        <circle cx="41" cy="18" r="1.8" fill={p.accent} stroke="none" />
        <path d="M8 33 Q12 29 16 33 Q20 29 24 33 Q28 29 32 33 Q36 29 40 33 Q44 29 48 33 Q52 29 56 33 L56 36 L8 36 Z" {...S(p)} />
        <rect x="8" y="37" width="48" height="8" rx="4" {...S(p)} />
        <path d="M18 41 L22 41 M30 41 L34 41 M42 41 L46 41" {...LINE(p)} />
        <path d="M10 47 H54 Q54 54 47 54 H17 Q10 54 10 47 Z" {...S(p)} />
      </>
    )} />
  ),

  "double-burger": () => (
    <Art draw={(p) => (
      <>
        <path d="M11 20 C11 9 20 5 32 5 C44 5 53 9 53 20 Z" {...S(p)} />
        <circle cx="23" cy="13" r="1.6" fill={p.accent} stroke="none" />
        <circle cx="41" cy="13" r="1.6" fill={p.accent} stroke="none" />
        <rect x="9" y="23" width="46" height="6" rx="3" {...S(p)} />
        <path d="M8 33 H56 L53 38 H11 Z" {...S(p)} />
        <rect x="9" y="39" width="46" height="6" rx="3" {...S(p)} />
        <path d="M10 47 H54 Q54 54 47 54 H17 Q10 54 10 47 Z" {...S(p)} />
      </>
    )} />
  ),

  drumstick: () => (
    <Art draw={(p) => (
      <>
        <path d="M34 34 L46 46" {...LINE(p)} strokeWidth={p.sw + 4} />
        <circle cx="48" cy="44" r="3.8" {...S(p)} />
        <circle cx="51" cy="49" r="3.8" {...S(p)} />
        <path d="M14 26 C10 18 18 10 28 13 C38 16 44 22 40 32 C36 40 26 42 22 38 C18 34 16 31 14 26 Z" {...S(p)} />
        <path d="M20 22 Q26 18 32 22" {...LINE(p)} />
        <circle cx="26" cy="30" r="1.8" fill={p.accent} stroke="none" />
      </>
    )} />
  ),

  wings: () => (
    <Art draw={(p) => (
      <>
        <path d="M30 44 C34 36 42 34 52 36 C58 38 58 46 52 50 C46 54 36 54 30 50 Z" {...S(p)} />
        <path d="M8 30 C10 18 22 12 34 16 C44 20 46 30 40 38 C34 46 20 46 14 40 C10 37 8 34 8 30 Z" {...S(p)} />
        <path d="M16 26 Q24 22 32 26" {...LINE(p)} />
        <path d="M22 36 Q28 34 34 38" {...LINE(p)} />
      </>
    )} />
  ),

  "fried-chicken": () => (
    <Art draw={(p) => (
      <>
        <ellipse cx="22" cy="24" rx="9" ry="7" {...S(p)} />
        <ellipse cx="38" cy="21" rx="10" ry="8" {...S(p)} />
        <path d="M12 34 L17 58 H47 L52 34 Z" {...S(p)} />
        <path d="M9 30 H55 V34 H9 Z" {...S(p)} />
        <path d="M24 42 L26 56 M40 42 L38 56" {...LINE(p)} />
      </>
    )} />
  ),

  fries: () => (
    <Art draw={(p) => (
      <>
        <path d="M22 28 L19 6 M30 28 L30 3 M38 28 L42 5 M46 28 L49 11" {...LINE(p)} />
        <path d="M14 30 L18 58 H46 L50 30 Z" {...S(p)} />
        <rect x="12" y="28" width="40" height="4" rx="2" {...S(p)} />
        <rect x="17" y="40" width="30" height="4" fill={p.accent} stroke="none" />
      </>
    )} />
  ),

  "loaded-fries": () => (
    <Art draw={(p) => (
      <>
        <path d="M24 28 L21 9 M36 28 L38 6 M46 28 L49 12" {...LINE(p)} />
        <path d="M10 30 C14 22 20 28 26 26 C32 22 36 30 42 26 C48 22 54 28 54 30 Z" {...S(p)} />
        <circle cx="24" cy="36" r="2" fill={p.accent} stroke="none" />
        <circle cx="44" cy="36" r="2" fill={p.accent} stroke="none" />
        <path d="M14 30 L18 58 H46 L50 30 Z" {...S(p)} />
      </>
    )} />
  ),

  pizza: () => (
    <Art draw={(p) => (
      <>
        <path d="M8 16 Q32 6 56 16 L32 58 Z" {...S(p)} />
        <path d="M8 16 Q32 6 56 16 L54 22 Q32 14 10 22 Z" {...S(p)} />
        <circle cx="26" cy="30" r="4" fill={p.accent} stroke="none" />
        <circle cx="38" cy="34" r="4.5" fill={p.accent} stroke="none" />
        <circle cx="31" cy="44" r="3.5" fill={p.accent} stroke="none" />
      </>
    )} />
  ),

  popcorn: () => (
    <Art draw={(p) => (
      <>
        <circle cx="20" cy="24" r="7" {...S(p)} />
        <circle cx="32" cy="18" r="8" {...S(p)} />
        <circle cx="44" cy="24" r="7" {...S(p)} />
        <circle cx="26" cy="30" r="6" {...S(p)} />
        <circle cx="38" cy="30" r="6" {...S(p)} />
        <path d="M14 32 L18 58 H46 L50 32 Z" {...S(p)} />
        <path d="M22 36 L25 58 M32 36 V58 M42 36 L39 58" {...LINE(p)} />
      </>
    )} />
  ),

  "popcorn-chicken": () => (
    <Art draw={(p) => (
      <>
        <circle cx="24" cy="30" r="6" {...S(p)} />
        <circle cx="34" cy="26" r="6.5" {...S(p)} />
        <circle cx="42" cy="32" r="5" {...S(p)} />
        <path d="M16 36 L20 56 H44 L48 36 Z" {...S(p)} />
        <path d="M20 44 H44" {...LINE(p)} />
      </>
    )} />
  ),

  juice: () => (
    <Art draw={(p) => (
      <>
        <path d="M36 14 L43 3" {...LINE(p)} />
        <path d="M17 20 L21 58 H43 L47 20 Z" {...S(p)} />
        <path d="M14 20 H50 L47 14 H17 Z" {...S(p)} />
        <rect x="19" y="36" width="26" height="6" fill={p.accent} stroke="none" />
      </>
    )} />
  ),

  soda: () => (
    <Art draw={(p) => (
      <>
        <path d="M38 22 L44 4" {...LINE(p)} />
        <path d="M14 26 L18 58 H46 L50 26 Z" {...S(p)} />
        <rect x="12" y="20" width="40" height="6" rx="2" {...S(p)} />
        <rect x="19" y="40" width="26" height="6" fill={p.accent} stroke="none" />
      </>
    )} />
  ),

  milkshake: () => (
    <Art draw={(p) => (
      <>
        <path d="M36 14 L44 2" {...LINE(p)} />
        <path d="M16 30 L20 58 H44 L48 30 Z" {...S(p)} />
        <path d="M13 32 Q14 18 24 20 Q28 10 36 16 Q46 10 51 32 Z" {...S(p)} />
        <circle cx="30" cy="12" r="3" fill={p.accent} stroke="none" />
        <path d="M22 44 H42" {...LINE(p)} />
      </>
    )} />
  ),

  sauce: () => (
    <Art draw={(p) => (
      <>
        <path d="M24 26 V56 Q24 60 28 60 H36 Q40 60 40 56 V26 Z" {...S(p)} />
        <path d="M29 18 V26 H35 V18 Z" {...S(p)} />
        <path d="M27 10 H37 V18 H27 Z" {...S(p)} />
        <rect x="24" y="34" width="16" height="10" fill={p.accent} stroke="none" />
      </>
    )} />
  ),

  "takeaway-bag": () => (
    <Art draw={(p) => (
      <>
        <path d="M24 22 V14 Q24 6 32 6 Q40 6 40 14 V22" {...LINE(p)} />
        <path d="M14 22 H50 L46 58 H18 Z" {...S(p)} />
        <rect x="18" y="36" width="28" height="8" fill={p.accent} stroke="none" />
      </>
    )} />
  ),

  "burger-box": () => (
    <Art draw={(p) => (
      <>
        <path d="M18 24 Q32 8 46 24 Z" {...S(p)} />
        <path d="M22 18 Q32 12 42 18" {...LINE(p)} />
        <rect x="10" y="24" width="44" height="32" rx="3" {...S(p)} />
        <path d="M10 40 H54" {...LINE(p)} />
        <circle cx="32" cy="48" r="3" fill={p.accent} stroke="none" />
      </>
    )} />
  ),

  combo: () => (
    <Art draw={(p) => (
      <>
        <path d="M12 26 L14 46 H24 L26 26 Z" {...S(p)} />
        <path d="M16 26 L14 12 M20 26 L22 10 M24 26 L28 14" {...LINE(p)} />
        <path d="M28 42 Q40 30 52 42 Z" {...S(p)} />
        <path d="M28 42 H52" {...LINE(p)} />
        <path d="M8 46 H56 L52 58 H12 Z" {...S(p)} />
      </>
    )} />
  ),

  "ice-cream": () => (
    <Art draw={(p) => (
      <>
        <path d="M22 32 L32 58 L42 32 Z" {...S(p)} />
        <path d="M26 38 L36 44 M38 38 L28 44" {...LINE(p)} />
        <path d="M14 34 Q14 14 32 14 Q50 14 50 34 Q42 38 36 34 Q32 38 28 34 Q22 38 14 34 Z" {...S(p)} />
        <circle cx="30" cy="38" r="2.5" fill={p.accent} stroke="none" />
      </>
    )} />
  ),
};

export type FoodIconName = keyof typeof ICONS;

export const FOOD_ICON_NAMES = Object.keys(ICONS) as FoodIconName[];

type Props = {
  name: FoodIconName;
  className?: string;
  style?: CSSProperties;
  /** Provide a label only for meaningful icons; decorative icons stay hidden from AT. */
  title?: string;
};

export function FoodIcon({ name, className, style, title }: Props) {
  const Draw = ICONS[name];
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      data-icon={name}
    >
      {title ? <title>{title}</title> : null}
      <Draw />
    </svg>
  );
}
