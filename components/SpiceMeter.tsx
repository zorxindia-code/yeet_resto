/** Compact heat indicator. Renders nothing for non-spicy items. */
export function SpiceMeter({ level, tone = "ink" }: { level: number; tone?: "ink" | "white" }) {
  if (!level) return null;
  const on = tone === "white" ? "bg-white" : "bg-brand";
  const off = tone === "white" ? "bg-white/35" : "bg-brand/25";
  return (
    <span role="img" className="inline-flex items-center gap-1.5" aria-label={`Spice level ${level} of 3`}>
      <span aria-hidden="true">Spicy</span>
      <span aria-hidden="true" className="flex gap-0.5">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-2 w-2 rounded-full ${n <= level ? on : off}`} />
        ))}
      </span>
    </span>
  );
}
