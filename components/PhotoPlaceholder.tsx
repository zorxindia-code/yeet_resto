import Image from "next/image";

type Props = {
  /** Describes the photo that should go here, e.g. "Classic burger, 3/4 angle". */
  label: string;
  /** Pass a real image path (under /public) to render it instead of the placeholder. */
  src?: string;
  alt?: string;
  ratio?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Clearly-labelled stand-in for realistic food/lifestyle photography.
 * Swap in real assets by passing `src`; nothing else in the layout changes.
 */
export function PhotoPlaceholder({
  label,
  src,
  alt,
  ratio = "4 / 5",
  className = "",
  sizes = "(min-width: 1024px) 40vw, 90vw",
  priority = false,
}: Props) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-paper ${className}`} style={{ aspectRatio: ratio }}>
        <Image src={src} alt={alt ?? label} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Photo placeholder: ${label}`}
      className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-paper p-6 text-center text-ink ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <div className="absolute inset-3 rounded-[28px] border-2 border-dashed border-brand/35" aria-hidden="true" />
      <span className="relative font-display text-xs uppercase tracking-[0.2em] text-brand">Photo placeholder</span>
      <span className="relative max-w-[18ch] font-body text-sm leading-snug text-ink/70">{label}</span>
    </div>
  );
}
