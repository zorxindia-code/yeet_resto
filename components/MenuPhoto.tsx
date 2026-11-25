import Image from "next/image";
import { FoodIcon, type FoodIconName } from "@/components/icons/FoodIcons";
import type { MenuImage } from "@/lib/menu";

type Props = {
  image: MenuImage | null;
  /** "" when the product name is printed next to the photo (the photo is then decorative). */
  alt: string;
  /** Product or category name, used by the placeholder. */
  label: string;
  /** Sticker icon shown on the placeholder when there is no photo. */
  icon: FoodIconName;
  /** Frame aspect ratio (width / height). */
  ratio?: number;
  /** Largest share of the frame's width and height the cutout may use. */
  fit?: number;
  /**
   * Upper limit on display size in CSS px per stored px. The poster cutouts are small, so they are
   * shown close to their real size instead of being stretched to fill the frame. Items from the
   * same poster section share a scale on the poster, so this also keeps them consistent.
   */
  maxScale?: number;
  sizes: string;
  preload?: boolean;
  className?: string;
  /** Classes for the product layer (hover motion). */
  productClassName?: string;
};

/**
 * Transparent product cutout centred in a fixed-ratio frame (no layout shift), grounded with a
 * soft contact shadow. Items without a photo get a clearly labelled, branded placeholder.
 */
export function MenuPhoto({
  image,
  alt,
  label,
  icon,
  ratio = 4 / 3,
  fit = 0.74,
  maxScale = 1.15,
  sizes,
  preload = false,
  className = "",
  productClassName = "",
}: Props) {
  const frame = { aspectRatio: String(ratio) };

  if (!image) {
    return (
      <div
        {...(alt ? { role: "img", "aria-label": `${alt}: photo coming soon` } : { "aria-hidden": true })}
        className={`relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-paper text-center ${className}`}
        style={frame}
        data-photo-status="missing"
        title={`${label}: photo coming soon`}
      >
        <span className="pointer-events-none absolute inset-2.5 rounded-[inherit] border-2 border-dashed border-brand/25" />
        <FoodIcon name={icon} className={`sticker-edge w-[24%] min-w-12 max-w-24 -rotate-6 ${productClassName}`} />
        <span className="sticker-label text-[0.7rem] text-brand">Photo coming soon</span>
      </div>
    );
  }

  const aspect = image.width / image.height;
  const pct = fit * 100;
  // Fit inside `fit` of the frame's width and height, but never beyond maxScale × stored size.
  const width = `min(${pct}%, ${((pct * aspect) / ratio).toFixed(2)}%, ${Math.round(image.width * maxScale)}px)`;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`} style={frame} data-photo-status="extracted">
      <div className={`relative ${productClassName}`} style={{ width }}>
        <span
          aria-hidden="true"
          className="absolute inset-x-[6%] -bottom-[5%] h-[16%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(70,25,10,0.28),transparent)]"
        />
        <Image
          src={image.src}
          alt={alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          quality={90}
          {...(preload ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
          className="relative h-auto w-full"
        />
      </div>
    </div>
  );
}
