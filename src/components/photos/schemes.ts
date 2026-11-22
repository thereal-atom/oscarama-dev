// Prototype matrix: page styles × colour schemes, served at /photos/<style>/<scheme>.
// The schemes are defined once here; each style component maps these semantic roles onto its own needs.

export type SchemeId = "orange-light" | "orange-dark" | "blue-light" | "green";
export type StyleId = "fable-2" | "fable-4";

export interface Scheme {
  id: SchemeId;
  label: string;
  /** the one loud colour */
  accent: string;
  /** the dark neutral and the light neutral (absolute — they never swap) */
  ink: string;
  paper: string;
  /** dark ground: the light neutral stops being a ground and ink/paper trade places as each style sees fit */
  dark: boolean;
}

export const schemes: Record<SchemeId, Scheme> = {
  "orange-light": { id: "orange-light", label: "orange light", accent: "#FF3B1F", ink: "#111111", paper: "#F3F1EA", dark: false },
  "orange-dark": { id: "orange-dark", label: "orange dark", accent: "#FF3B1F", ink: "#111111", paper: "#F3F1EA", dark: true },
  "blue-light": { id: "blue-light", label: "blue light", accent: "#0000F2", ink: "#111111", paper: "#F3F1EA", dark: false },
  green: { id: "green", label: "green / black / white", accent: "#12B85A", ink: "#0E0E0E", paper: "#F2F0E6", dark: false },
};
export const schemeIds = Object.keys(schemes) as SchemeId[];

const core: SchemeId[] = ["orange-light", "orange-dark", "blue-light", "green"];
export const styles: Array<{ id: StyleId; label: string; key: string; short: string; defaultScheme: SchemeId; schemes: SchemeId[] }> = [
  { id: "fable-2", label: "fable 2", key: "1", short: "F2", defaultScheme: "orange-dark", schemes: core },
  { id: "fable-4", label: "fable 4", key: "2", short: "F4", defaultScheme: "orange-light", schemes: core },
];
export const styleIds = styles.map((s) => s.id);
/** keyboard shortcuts for the schemes, in schemeIds order */
export const schemeKeys = ["q", "w", "e", "r"];

export const isScheme = (x: unknown): x is SchemeId => typeof x === "string" && x in schemes;
export const isStyle = (x: unknown): x is StyleId => typeof x === "string" && (styleIds as string[]).includes(x);

// ── colour helpers ──
export type RGB = [number, number, number];
export const rgb = (h: string): RGB => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const hex2 = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
export const toHex = ([r, g, b]: RGB) => `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
/** hex colour at alpha a, as rgba() */
export const alpha = (h: string, a: number) => `rgba(${rgb(h).join(",")},${a})`;
/** mix: t = 0 → a, t = 1 → b */
export const mix = (a: string, b: string, t: number) => {
  const A = rgb(a), B = rgb(b);
  return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
};
const lum = (h: string) => {
  const c = rgb(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a: string, b: string) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** text colour to set on an accent ground: `prefer` (ink | paper) unless it falls under `min` contrast, then the other */
export function onAccent(s: Scheme, prefer: "ink" | "paper", min: number) {
  const other = prefer === "ink" ? "paper" : "ink";
  return contrast(s[prefer], s.accent) >= min ? s[prefer] : s[other];
}
/** the accent as type / marks on the ink ground; a dark accent (blue) is lifted toward paper so it stays legible */
export const accentOnInk = (s: Scheme) => (contrast(s.accent, s.ink) >= 3 ? s.accent : mix(s.accent, s.paper, 0.5));
