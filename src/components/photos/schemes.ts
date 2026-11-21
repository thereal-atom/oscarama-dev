// Prototype matrix: 4 page styles × 4 colour schemes, served at /photos/<style>/<scheme>.
// The schemes are defined once here; each style component maps these semantic roles onto its own needs.

export type SchemeId =
  | "orange-light" | "orange-dark" | "blue-light" | "green"
  // style-specific schemes for the poster-inspired styles (each style lists the ones it supports)
  | "afterburner" | "concorde" | "ultramarine" | "graphite" | "ink-blue" | "ink-red" | "nebula" | "infrared";
export type StyleId = "opus-1" | "fable-2" | "fable-2-blueprint" | "fable-4" | "motion" | "halftone" | "raptor" | "hubble";

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
  // ── poster-inspired styles (owners may tune their own entries) ──
  afterburner: { id: "afterburner", label: "afterburner red", accent: "#FF4A1C", ink: "#2A0604", paper: "#F3E6E1", dark: true },
  concorde: { id: "concorde", label: "concorde orange", accent: "#FF8A3D", ink: "#1C0D07", paper: "#FCEBDD", dark: false },
  ultramarine: { id: "ultramarine", label: "ultramarine", accent: "#3326D9", ink: "#090725", paper: "#E8EBF7", dark: true },
  graphite: { id: "graphite", label: "graphite", accent: "#8A93A0", ink: "#0B0C0E", paper: "#ECEDEF", dark: true },
  "ink-blue": { id: "ink-blue", label: "ink + blue", accent: "#1F8FEF", ink: "#111111", paper: "#F2F1EE", dark: false },
  "ink-red": { id: "ink-red", label: "ink + red", accent: "#E8402C", ink: "#111111", paper: "#F2F1EE", dark: false },
  nebula: { id: "nebula", label: "nebula", accent: "#45C8E8", ink: "#050608", paper: "#EAF5FA", dark: true },
  infrared: { id: "infrared", label: "infrared", accent: "#FF6A3D", ink: "#070405", paper: "#FBEDE6", dark: true },
};
export const schemeIds = Object.keys(schemes) as SchemeId[];

const core: SchemeId[] = ["orange-light", "orange-dark", "blue-light", "green"];
export const styles: Array<{ id: StyleId; label: string; key: string; short: string; defaultScheme: SchemeId; schemes: SchemeId[] }> = [
  { id: "opus-1", label: "opus 1", key: "1", short: "O1", defaultScheme: "orange-light", schemes: core },
  { id: "fable-2", label: "fable 2", key: "2", short: "F2", defaultScheme: "orange-dark", schemes: core },
  { id: "fable-2-blueprint", label: "fable 2 blueprint", key: "3", short: "BP", defaultScheme: "orange-light", schemes: core },
  { id: "fable-4", label: "fable 4", key: "4", short: "F4", defaultScheme: "orange-light", schemes: core },
  { id: "motion", label: "motion (opus)", key: "5", short: "MO", defaultScheme: "afterburner", schemes: ["afterburner", "concorde"] },
  { id: "halftone", label: "halftone (fable)", key: "6", short: "HT", defaultScheme: "ultramarine", schemes: ["ultramarine", "graphite"] },
  { id: "raptor", label: "raptor (opus)", key: "7", short: "RP", defaultScheme: "ink-blue", schemes: ["ink-blue", "ink-red"] },
  { id: "hubble", label: "hubble (fable)", key: "8", short: "HB", defaultScheme: "nebula", schemes: ["nebula", "infrared"] },
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

// ── style-specific constants that don't derive from the four roles ──
/** classic cyanotype for the blueprint style's blue-light sheet (the user asked for "the standard blue blueprint colour") */
export const cyanotype = {
  ground: "#1C4F9C", deep: "#133A78", line: "#FFFFFF", lettering: "#DDE8FA", altFg: "#E6EEFB",
  whiteprint: "#E8EFFA", whiteprintInk: "#173F85", viewerBg: "#0E2C5E", viewerFg: "#EEF4FF",
};
