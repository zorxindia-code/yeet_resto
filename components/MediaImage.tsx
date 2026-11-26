import { getImageProps, type ImageProps } from "next/image";

// 1×1 transparent GIF, inline: choosing it costs no request.
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

type Props = ImageProps & {
  /** Media query where the image is NOT shown (e.g. "(max-width: 767px)" for a desktop-only image). */
  skip: string;
};

/**
 * next/image optimisation, but only downloaded where it is displayed. Hiding an <Image> with CSS
 * still downloads it (and fetchPriority="high" makes Next add a preload for every screen); here a
 * <picture> source hands the browser a blank inline GIF for `skip`, so nothing is fetched there.
 */
export function MediaImage({ skip, ...image }: Props) {
  const { props } = getImageProps(image);
  return (
    <picture>
      <source media={skip} srcSet={BLANK} />
      <img {...props} alt={props.alt} />
    </picture>
  );
}
