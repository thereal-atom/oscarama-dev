// Round-3 client-side helpers.
export { reduced, readJSON, viewerNav, lockScroll, mailto, loadImage, fitText, type ClientShot } from "@/components/photos/opus/util";
export { atkinson, cover } from "@/components/photos/opus/dither";

/** Resize a picsum `/seed/x/W/H` url to width `w`, keeping aspect. */
export function sized(src: string, w: number) {
  return src.replace(/\/(\d+)\/(\d+)$/, (_, W, H) => `/${w}/${Math.round((+H * w) / +W)}`);
}

let tok = 0;
/**
 * Show a photo in a viewer <img> instantly: `low` (an already-loaded url, e.g.
 * the thumb the user just tapped) goes in immediately at full display size,
 * then `high` is swapped in once decoded. Stale swaps are ignored.
 */
export function instant(img: HTMLImageElement, low: string, high: string, onHigh?: () => void) {
  const my = ++tok;
  img.src = low;
  img.dataset.res = "low";
  if (low === high) return;
  const hi = new Image();
  hi.decoding = "async";
  hi.src = high;
  const swap = () => {
    if (my !== tok) return;
    img.src = high;
    img.dataset.res = "high";
    onHigh?.();
  };
  (hi.decode ? hi.decode() : new Promise((r) => (hi.onload = r))).then(swap, () => {});
}

/** Lazy-load `img[data-src]` inside `root` shortly before they scroll in. */
export function lazy(root: ParentNode = document, onLoad?: (img: HTMLImageElement) => void, margin = "600px") {
  const io = new IntersectionObserver(
    (ents) =>
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const img = e.target as HTMLImageElement;
        io.unobserve(img);
        img.addEventListener("load", () => onLoad?.(img), { once: true });
        img.src = img.dataset.src!;
      }),
    { rootMargin: margin },
  );
  root.querySelectorAll<HTMLImageElement>("img[data-src]").forEach((i) => io.observe(i));
  return io;
}
