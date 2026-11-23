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

// ── round 2: more creative Oscar Shoots ideas ──
export type IdeaId = "sprout" | "statuette" | "screen" | "peaking" | "contact" | "pass" | "slate" | "rolling" | "burst" | "bracket" | "aperture";

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
