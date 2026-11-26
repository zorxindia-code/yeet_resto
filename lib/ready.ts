/**
 * Resolves when what the first screen needs is actually ready: web fonts, plus every image marked
 * `data-lcp` (the hero's main image for the current breakpoint) loaded and decoded. Never waits for
 * the rest of the page. `timeoutMs` caps the wait so a slow image can never trap the visitor.
 * Call it after hydration (from an effect): reaching that point is part of "ready".
 */
export function whenEssentialsReady(timeoutMs: number): Promise<void> {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>("img[data-lcp]"));
  const imageReady = (img: HTMLImageElement) =>
    img.complete
      ? img.naturalWidth > 0
        ? img.decode().catch(() => undefined)
        : Promise.resolve()
      : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const essentials = Promise.all([fonts, ...images.map(imageReady)]).then(() => undefined);
  const cap = new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs));
  return Promise.race([essentials, cap]);
}

/** sessionStorage key: set once the first-visit intro has been finished or skipped. */
export const INTRO_SEEN_KEY = "yeet-intro-seen";
