// shared drawing bits for the little blob people

export const INK = "#1b1525";
export const SUN = "#ffc833";
export const SUN_DEEP = "#f3b312";
export const VIOLET = "#6c47ff";
export const TEAL = "#12b5a6";
export const TOMATO = "#ef4b2f";
export const PAPER = "#fffdf6";

// body colours. weighted so white + violet dominate on the yellow ground
export const PAL = [PAPER, VIOLET, TEAL, TOMATO, INK, PAPER, VIOLET, TEAL];

export function pickColour() {
  return Math.floor(Math.random() * PAL.length);
}

/**
 * one blob person: shadow, body, outline, two eyes that look along (fx, fy).
 * `lift` raises the body off its shadow (hops).
 */
export function drawBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  c: number,
  fx: number,
  fy: number,
  lift = 0,
  blink = false
) {
  // shadow
  ctx.fillStyle = "rgba(120, 78, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.82, r * 0.86, r * 0.34, 0, 0, 6.2832);
  ctx.fill();

  const by = y - lift;
  ctx.fillStyle = PAL[c];
  ctx.beginPath();
  ctx.arc(x, by, r, 0, 6.2832);
  ctx.fill();
  ctx.lineWidth = Math.max(1.4, r * 0.24);
  ctx.strokeStyle = INK;
  ctx.stroke();

  // eyes
  const ex = x + fx * r * 0.34;
  const ey = by + fy * r * 0.3 - r * 0.08;
  const gap = r * 0.36;
  ctx.fillStyle = PAL[c] === INK ? PAPER : INK;
  if (blink) {
    ctx.fillRect(ex - gap - r * 0.16, ey, r * 0.32, Math.max(1, r * 0.1));
    ctx.fillRect(ex + gap - r * 0.16, ey, r * 0.32, Math.max(1, r * 0.1));
  } else {
    const er = Math.max(0.9, r * 0.15);
    ctx.beginPath();
    ctx.arc(ex - gap, ey, er, 0, 6.2832);
    ctx.arc(ex + gap, ey, er, 0, 6.2832);
    ctx.fill();
  }
}

/** sample points inside fat lettering so a crowd can stand in the shape of a word */
export function sampleText(
  text: string,
  font: string,
  cx: number,
  cy: number,
  maxW: number,
  maxH: number,
  target: number,
  minSpace: number,
  maxStretch = 1
): { x: number; y: number }[] {
  const cv = document.createElement("canvas");
  const FS = 160;
  cv.width = Math.ceil(FS * text.length * 0.9 + 80);
  cv.height = Math.ceil(FS * 1.6);
  const c = cv.getContext("2d", { willReadFrequently: true });
  if (!c) return [];
  c.font = `900 ${FS}px ${font}`;
  c.textBaseline = "alphabetic";
  c.fillStyle = "#000";
  c.fillText(text, 40, FS * 1.15);
  const data = c.getImageData(0, 0, cv.width, cv.height).data;
  const on = (px: number, py: number) => {
    if (px < 0 || py < 0 || px >= cv.width || py >= cv.height) return false;
    return data[((py | 0) * cv.width + (px | 0)) * 4 + 3] > 120;
  };
  let x0 = cv.width,
    x1 = 0,
    y0 = cv.height,
    y1 = 0;
  for (let y = 0; y < cv.height; y += 2)
    for (let x = 0; x < cv.width; x += 2)
      if (data[(y * cv.width + x) * 4 + 3] > 120) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 <= x0 || y1 <= y0) return [];
  const bw = x1 - x0,
    bh = y1 - y0;
  const sx = maxW / bw;
  const sy = Math.min(maxH / bh, sx * maxStretch);
  const w = bw * sx,
    h = bh * sy;

  const run = (s: number) => {
    const pts: { x: number; y: number }[] = [];
    const rowH = s * 0.88;
    let row = 0;
    for (let y = s * 0.5; y < h; y += rowH, row++) {
      for (let x = (row % 2 ? s : s * 0.5) * 0.99; x < w; x += s) {
        if (on(x0 + x / sx, y0 + y / sy)) pts.push({ x: cx - w / 2 + x, y: cy - h / 2 + y });
      }
    }
    return pts;
  };
  let lo = minSpace,
    hi = minSpace * 5,
    best = run(lo);
  if (best.length <= target) return best;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    const pts = run(mid);
    if (pts.length >= target) {
      best = pts;
      lo = mid;
    } else hi = mid;
  }
  return best;
}
