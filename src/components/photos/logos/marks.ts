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
