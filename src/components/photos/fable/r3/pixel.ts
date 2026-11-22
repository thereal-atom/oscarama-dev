// Giant-pixel mosaics of a photo: draw it cover-fitted at cols×rows and (optionally) posterise it to a few flat
// tones by luminance rank, so every photo yields the same balance of colours. Scale the canvas up with
// `image-rendering: pixelated`. The image must be CORS-readable for the posterise step; if it isn't, the
// plain low-res colour version is left on the canvas.
export type RGB = [number, number, number];
export const hex = (h: string): RGB => { const n = parseInt(h.replace("#", ""), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

export function mosaic(cv: HTMLCanvasElement, img: HTMLImageElement, cols: number, rows: number, tones?: RGB[] | null): boolean {
  cols = Math.max(1, Math.round(cols)); rows = Math.max(1, Math.round(rows));
  if (cv.width !== cols) cv.width = cols; if (cv.height !== rows) cv.height = rows;
  const x = cv.getContext("2d", { willReadFrequently: true }); if (!x) return false;
  const iw = img.naturalWidth, ih = img.naturalHeight; if (!iw || !ih) return false;
  // cover-fit by overflowing the destination (source-rect coordinates are unreliable for srcset images)
  const r = Math.max(cols / iw, rows / ih), dw = iw * r, dh = ih * r;
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
  x.clearRect(0, 0, cols, rows);
  x.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
  if (!tones || !tones.length) return true;
  let id: ImageData;
  try { id = x.getImageData(0, 0, cols, rows); } catch { return false; }
  const d = id.data, n = cols * rows, lum = new Float32Array(n);
  for (let i = 0; i < n; i++) lum[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  const sorted = Float32Array.from(lum).sort();
  const cut = tones.map((_, t) => sorted[Math.min(n - 1, Math.floor(((t + 1) * n) / tones.length))]);
  for (let i = 0; i < n; i++) {
    let t = 0; while (t < tones.length - 1 && lum[i] >= cut[t]) t++;
    d[i * 4] = tones[t][0]; d[i * 4 + 1] = tones[t][1]; d[i * 4 + 2] = tones[t][2]; d[i * 4 + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  return true;
}
