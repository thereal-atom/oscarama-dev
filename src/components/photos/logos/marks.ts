// Bitmaps for the logo concepts. '#' = ink, 'g' = accent, '.' = empty (same convention as fable/r3/bits.ts).
import { glyphRows } from "@/components/photos/fable/r3/bits";

export type MarkId = "wordmark" | "split" | "stack" | "pixel" | "dissolve" | "lens" | "camera" | "module" | "viewfinder" | "hand" | "sticker" | "app";

/** seeded thinning: cells past `from` (0–1 across the width) drop out more and more, a few strays turn accent */
function thin(rows: string[], seed: number, from: number): string[] {
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const w = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => [...r].map((c, x) => {
    const t = (x / w - from) / (1 - from);
    if (t <= 0 || c !== "#") return c;
    const roll = rnd();
    return roll < t * 0.85 ? (roll < t * 0.12 ? "g" : ".") : "#";
  }).join(""));
}

export type ShootsId = "wordmark" | "weights" | "verb" | "stack" | "pixel" | "lens-o" | "viewfinder" | "rec" | "hand" | "sticker" | "tile";
export const shootsPixel = glyphRows("OSCAR SHOOTS.");
export const shootsPixelStack = [...glyphRows("OSCAR"), ".".repeat(24), ...glyphRows("SHOOTS.")];
export const osPixel = glyphRows("OS.");

export const pixelWord = glyphRows("OSCARAMA.");
export const pixelO = glyphRows("O.");
export const dissolveWord = thin(glyphRows("OSCARAMA"), 11, 0.45);
export const dissolveO = thin(glyphRows("O"), 4, 0.2);

export const lens = [
  "..#####..",
  ".#.....#.",
  "#..###..#",
  "#.#...#.#",
  "#.#.g.#.#",
  "#.#...#.#",
  "#..###..#",
  ".#.....#.",
  "..#####..",
];

export const camera = [
  "....###....",
  "###########",
  "#.........#",
  "#...###.g.#",
  "#..#...#..#",
  "#..#...#..#",
  "#...###...#",
  "#.........#",
  "###########",
];

// ── round 2/3: Oscar Shoots ideas ──
export type IdeaId = "statuette" | "bracket" | "bracket-px" | "laurels" | "trail" | "double" | "histogram" | "thirds" | "zoom" | "noise" | "raw" | "crop";

const seeded = (seed: number) => { let s = seed * 9301 + 49297; return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff); };
const width = (rows: string[]) => Math.max(...rows.map((r) => r.length));
const padRows = (rows: string[]) => { const w = width(rows); return rows.map((r) => r.padEnd(w, ".")); };

/** the award statuette, holding a camera up to its face */
export const statuette = [
  "..ggg..",
  "..g##..",
  "..g##..",
  "...g...",
  ".ggggg.",
  "gg.g.gg",
  "g..g..g",
  "..ggg..",
  "..ggg..",
  "..g.g..",
  "..g.g..",
  "..g.g..",
  ".ggggg.",
  "#######",
  "#######",
];

export const shootsWord = glyphRows("OSCAR SHOOTS");
export const osWord = glyphRows("OS");
export const oGlyph = glyphRows("O");

/** exposure bracket in pixels: −1 = underexposed (cells drop out), 0 = as shot, +1 = blown (accent, bloomed a cell wider) */
export function expose(rows: string[], ev: -1 | 0 | 1, seed = 3): string[] {
  const r = padRows(rows);
  if (ev === 0) return r;
  if (ev === -1) { const rnd = seeded(seed); return r.map((row) => [...row].map((c) => (c === "#" && rnd() < 0.35 ? "." : c)).join("")); }
  return r.map((row) => [...row].map((c, x) => (c === "#" || row[x - 1] === "#" ? "g" : ".")).join("") + ".");
}

/** laurel branch (left); the right one is the mirror */
export const laurelL = [
  "...g..",
  "..gg..",
  ".g#...",
  "gg#...",
  ".g#...",
  "gg#...",
  ".g.#..",
  "gg.#..",
  "..g.#.",
  "...g.#",
  "....##",
];
export const laurelR = laurelL.map((r) => [...r].reverse().join(""));

/** long exposure: every row trails off to the right in the accent, thinning out */
export function trail(rows: string[], seed: number, len: number): string[] {
  const rnd = seeded(seed), w = width(rows);
  return padRows(rows).map((row) => {
    const last = row.lastIndexOf("#");
    if (last < 0) return row + ".".repeat(len);
    let out = row;
    for (let i = 0; i < len; i++) out += rnd() < 1 - i / len ? "g" : ".";
    return out.slice(0, w + len);
  });
}

/** the word, a blank row, then its own histogram: one accent bar per column, as tall as that column's ink */
export function histogram(rows: string[]): string[] {
  const r = padRows(rows), w = width(r), h = r.length;
  const counts = Array.from({ length: w }, (_, x) => r.filter((row) => row[x] === "#").length);
  const bars = Array.from({ length: h }, (_, y) => counts.map((c) => (c >= h - y ? "g" : ".")).join(""));
  return [...r, ".".repeat(w), ...bars];
}

/** high-ISO noise: some cells drop, specks of ink and accent appear around the letters */
export function noise(rows: string[], seed: number): string[] {
  const rnd = seeded(seed), r = padRows(rows), w = width(r);
  const pad = ".".repeat(w + 2);
  return [pad, ...r.map((row) => "." + row + "."), pad].map((row) => [...row].map((c) => {
    const n = rnd();
    if (c === "#") return n < 0.12 ? "." : n < 0.18 ? "g" : "#";
    return n < 0.06 ? "#" : n < 0.11 ? "g" : ".";
  }).join(""));
}

// ── round 2 as first shown (restored alongside round 3) ──
export type Round2Id = "sprout" | "statuette" | "screen" | "peaking" | "contact" | "pass" | "slate" | "rolling" | "burst" | "bracket" | "aperture";

/** a pixel sprout: green shoots (startups growing) as the full stop */
export const sprout = [
  "gg.gg",
  "ggggg",
  ".ggg.",
  "..#..",
  "..#..",
  "..#..",
  "..#..",
  ".###.",
];

/** the award statuette, holding a camera up to its face */

/** six-blade aperture as an SVG path set (viewBox -50 -50 100 100): outer ring, blade lines, hexagonal opening */
export const aperture = (() => {
  const R = 46, r = 19;
  const pt = (rad: number, a: number) => [+(rad * Math.cos(a)).toFixed(2), +(rad * Math.sin(a)).toFixed(2)];
  const hex = Array.from({ length: 6 }, (_, i) => pt(r, (Math.PI / 3) * i - Math.PI / 2));
  const blades = hex.map(([x, y], i) => {
    // each blade edge runs from a hexagon corner out to the ring, tangent-ish (rotated 60° on from the corner)
    const a = Math.atan2(y, x) + Math.PI / 2.2;
    const [ex, ey] = [x + Math.cos(a) * 60, y + Math.sin(a) * 60];
    // clip to the ring: walk back until inside R
    let t = 1; while (Math.hypot(x + (ex - x) * t, y + (ey - y) * t) > R) t -= 0.01;
    return `M${x} ${y}L${(x + (ex - x) * t).toFixed(2)} ${(y + (ey - y) * t).toFixed(2)}`;
  }).join("");
  return { hex: hex.map(([x, y]) => `${x},${y}`).join(" "), blades, R };
})();
