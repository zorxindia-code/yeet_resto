import { getImageProps } from "next/image";

/** Intro (sticker-peel preloader) logo: shared by the overlay and the inline intro script. */
export const INTRO_LOGO = { src: "/brand/yeet-logo.png", width: 1080, height: 579, sizes: "(min-width: 768px) 300px, 220px" } as const;

/**
 * The exact srcset the overlay's <img> uses, so a preload started by the inline intro script is
 * reused by the image instead of fetching twice.
 */
export const introLogoSrcSet = () =>
  getImageProps({ src: INTRO_LOGO.src, width: INTRO_LOGO.width, height: INTRO_LOGO.height, sizes: INTRO_LOGO.sizes, alt: "" }).props.srcSet ?? "";
