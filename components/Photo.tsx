import Image from "next/image";

type Props = {
  src?: string;
  alt: string;
  /** Shown only if `src` is missing, describing the photo that should go there. */
  label?: string;
  /** CSS aspect-ratio, or "auto" when the parent sets the height. */
  ratio?: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  /** LCP image: load eagerly at high priority (Next 16 guidance over the `preload` prop). */
  preload?: boolean;
  /** CSS object-position for art-directing the crop, e.g. "50% 30%". */
  position?: string;
};

/**
 * Responsive photo with reserved dimensions (no layout shift). Next/Image serves
 * AVIF/WebP at the requested `sizes`; below-the-fold photos lazy-load by default.
 * Falls back to a clearly labelled placeholder when no photo is assigned yet.
 */
export function Photo({
  src,
  alt,
  label,
  ratio = "4 / 3",
  className = "",
  imgClassName = "",
  sizes = "(min-width: 1024px) 40vw, 90vw",
  preload = false,
  position,
}: Props) {
  const style = ratio === "auto" ? undefined : { aspectRatio: ratio };

  if (!src) {
    return (
      <div
        role="img"
        aria-label={`Photo placeholder: ${label ?? alt}`}
        className={`relative flex items-center justify-center bg-paper p-6 text-center ${className}`}
        style={style}
      >
        <span className="font-body text-sm text-ink/70">Photo to come: {label ?? alt}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-paper ${className}`} style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        {...(preload ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
        className={`object-cover ${imgClassName}`}
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  );
}
