// 1-bit Atkinson dithering + block pixelation helpers (canvas, client-side).

/** Draw `img` cover-fitted into a w×h canvas context. */
export function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const iw = img.naturalWidth * r,
    ih = img.naturalHeight * r;
  ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
}

/**
 * Atkinson-dither `img` into an ImageData of w×h where dark pixels become
 * `ink` (rgba) and light pixels transparent. `bias` shifts the threshold
 * (-1 → mostly ink, +1 → mostly empty).
 */
export function atkinson(img: HTMLImageElement, w: number, h: number, ink: [number, number, number], bias = 0, contrast = 1.25) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  cover(x, img, w, h);
  const src = x.getImageData(0, 0, w, h);
  const d = src.data;
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const l = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
    lum[i] = (l - 0.5) * contrast + 0.5 + bias * 0.5;
  }
  const out = x.createImageData(w, h);
  const o = out.data;
  const push = (i: number, e: number) => {
    if (i >= 0 && i < lum.length) lum[i] += e;
  };
  for (let y = 0; y < h; y++)
    for (let xx = 0; xx < w; xx++) {
      const i = y * w + xx;
      const v = lum[i] < 0.5 ? 0 : 1;
      const e = (lum[i] - v) / 8;
      if (xx + 1 < w) push(i + 1, e);
      if (xx + 2 < w) push(i + 2, e);
      if (xx > 0) push(i + w - 1, e);
      push(i + w, e);
      if (xx + 1 < w) push(i + w + 1, e);
      push(i + 2 * w, e);
      if (v === 0) {
        o[i * 4] = ink[0];
        o[i * 4 + 1] = ink[1];
        o[i * 4 + 2] = ink[2];
        o[i * 4 + 3] = 255;
      }
    }
  return out;
}

/** Quantise `img` into a cols×rows grid of palette colours by luminance thresholds. */
export function blocks(img: HTMLImageElement, cols: number, rows: number, palette: string[], cuts: number[]) {
  const c = document.createElement("canvas");
  c.width = cols;
  c.height = rows;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  cover(x, img, cols, rows);
  const d = x.getImageData(0, 0, cols, rows).data;
  const out: string[] = [];
  for (let i = 0; i < cols * rows; i++) {
    const l = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
    let k = 0;
    while (k < cuts.length && l > cuts[k]) k++;
    out.push(palette[k]);
  }
  return out;
}
