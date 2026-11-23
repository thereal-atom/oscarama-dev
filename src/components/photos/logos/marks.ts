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
export type IdeaId = "statuette" | "burst" | "burst-px" | "laurels" | "trail" | "double" | "histogram" | "thirds" | "zoom" | "noise" | "raw" | "crop";

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

/** burst mode in pixels, drawn like the type version: the ink from column `from` on is repeated 1, 2 and 3 cells to
 *  the left in the accent at falling opacity, underneath the letters. Returns SVG paths for <svg viewBox="0 0 w h">. */
export function burstPx(rows: string[], from: number, lead = 0) {
  const r = padRows(rows), w = width(r) + lead, h = r.length;
  const cells = (pick: (c: string, x: number) => boolean, dx: number) => {
    let d = "";
    r.forEach((row, y) => [...row].forEach((c, x) => { if (pick(c, x)) d += `M${x + lead - dx} ${y}h1v1h-1z`; }));
    return d;
  };
  const echoes = [[3, 0.2], [2, 0.45], [1, 0.75]].map(([dx, o]) => ({ d: cells((c, x) => c === "#" && x >= from, dx), o }));
  return { w, h, ink: cells((c) => c === "#", 0), echoes };
}
/** words side by side with `gap` empty columns: the echoes need room, or they fill the space between words */
const join = (a: string[], b: string[], gap: number) => a.map((row, y) => row + ".".repeat(gap) + b[y]);
const oscar = glyphRows("OSCAR"), shootsG = glyphRows("SHOOTS");
export const burstWord = burstPx(join(oscar, shootsG, 7), oscar[0].length + 7);
export const burstO = burstPx(join(glyphRows("O"), glyphRows("S"), 4), 8);

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
