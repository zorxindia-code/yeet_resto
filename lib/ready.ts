/**
 * Readiness milestones for the homepage loader. Each one resolves once that thing is actually usable.
 * None of them waits for the rest of the page, and none can hang: a failed image counts as settled.
 */

/** Resolves once an image has its pixels decoded, or has failed (a broken image must not block). */
export function imageReady(img: HTMLImageElement): Promise<void> {
  if (img.complete) {
    return img.naturalWidth > 0 ? img.decode().catch(() => undefined) : Promise.resolve();
  }
  return new Promise((resolve) => {
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

/** Resolves once every hero image marked `data-lcp` (this breakpoint's main image) is decoded. */
export function heroImagesReady(): Promise<void> {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>("img[data-lcp]"));
  return Promise.all(images.map(imageReady)).then(() => undefined);
}

/** sessionStorage key: set once the first-visit loader has finished. */
export const INTRO_SEEN_KEY = "yeet-intro-seen";
