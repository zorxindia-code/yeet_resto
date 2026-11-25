import { FoodIcon, type FoodIconName } from "@/components/icons/FoodIcons";

type Props = {
  /** "red" = white icons on red surface; "white" = low-opacity red icons on white. */
  tone?: "red" | "white";
  density?: "low" | "medium";
  /** Rotates the icon order so each section starts with a different sticker. */
  offset?: number;
  className?: string;
};

// No burger here: the hero, assembly and bag already carry it. Variety keeps the pattern from reading as filler.
const ORDER: FoodIconName[] = ["drumstick", "fries", "star", "pizza", "juice", "wings", "popcorn", "takeaway-bag", "milkshake"];

/** Subtle, decorative background pattern. Always aria-hidden. */
export function FoodIconPattern({ tone = "white", density = "low", offset = 0, className = "" }: Props) {
  const count = density === "low" ? 6 : 10;
  const items = Array.from({ length: count }, (_, i) => ({
    name: ORDER[(i + offset) % ORDER.length],
    left: (i * 37) % 92,
    top: (i * 53) % 88,
    rot: ((i * 29) % 50) - 25,
    size: 56 + ((i * 17) % 44),
  }));
  const opacity = tone === "red" ? "opacity-[0.16]" : "opacity-[0.07]";
  const color = tone === "red" ? "text-white" : "text-brand";

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${color} ${opacity} ${className}`}>
      {items.map((it, i) => (
        <FoodIcon
          key={`${it.name}-${i}`}
          name={it.name}
          className="absolute"
          style={{ left: `${it.left}%`, top: `${it.top}%`, width: it.size, height: it.size, transform: `rotate(${it.rot}deg)` }}
        />
      ))}
    </div>
  );
}
