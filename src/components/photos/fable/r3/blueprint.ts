// Palettes for the "MODULE / blueprint" style. One page component (ModuleBlueprint.astro) renders every scheme;
// everything that differs between sheets lives here, built from the shared schemes (../../schemes.ts).
import { schemes, alpha, cyanotype as C, type SchemeId } from "@/components/photos/schemes";

export interface Tone { bg: string; fg: string; line: string; minor: string; hi: string }
export interface BlueprintPalette {
  id: SchemeId;
  /** sheet ground, line work / accent, lettering */
  ground: string; accent: string; type: string;
  /** main sheet rules: major (module) and minor (1/4 module) */
  line: string; minor: string;
  /** the "about" + "shot for" sections; darkLogos = the (white) client logos need printing dark on this ground */
  alt: Tone & { em: string; darkLogos: boolean };
  /** the booking slab; key = fields / selected / send, hov = hover */
  slab: Tone & { keyBg: string; keyFg: string; keyHi: string; hovBg: string; hovFg: string };
  viewer: { bg: string; fg: string; accent: string; onAccent: string };
  note: string;
}

const O = schemes["orange-dark"], G = schemes.green;

export const palettes: Record<SchemeId, BlueprintPalette> = {
  // blue-light → the classic cyanotype: Prussian blue ground, white line work, pale-blue lettering (a blue-ground
  // print, not a paper ground — kept on purpose, it's "the standard blue blueprint colour")
  "blue-light": {
    id: "blue-light", ground: C.ground, accent: C.line, type: C.lettering,
    line: alpha(C.line, 0.34), minor: alpha(C.line, 0.075),
    alt: { bg: C.deep, fg: C.altFg, line: alpha(C.line, 0.24), minor: alpha(C.line, 0.055), hi: C.line, em: alpha(C.line, 0.7), darkLogos: false },
    slab: { bg: C.whiteprint, fg: C.whiteprintInk, line: alpha(C.whiteprintInk, 0.3), minor: alpha(C.whiteprintInk, 0.09), hi: C.whiteprintInk,
      keyBg: C.ground, keyFg: C.line, keyHi: C.line, hovBg: C.deep, hovFg: C.line },
    viewer: { bg: C.viewerBg, fg: C.viewerFg, accent: C.viewerFg, onAccent: C.ground },
    note: `blueprint ${C.ground} · line ${C.line} · lettering ${C.lettering} · deep ${C.deep} · whiteprint ${C.whiteprint} / ink ${C.whiteprintInk}`,
  },
  // orange-dark → the sheet on an ink ground, orange line work, paper lettering
  "orange-dark": {
    id: "orange-dark", ground: O.ink, accent: O.accent, type: O.paper,
    line: alpha(O.accent, 0.42), minor: alpha(O.accent, 0.11),
    alt: { bg: O.paper, fg: O.ink, line: alpha(O.ink, 0.22), minor: alpha(O.ink, 0.06), hi: O.ink, em: O.accent, darkLogos: true },
    slab: { bg: O.accent, fg: O.ink, line: alpha(O.ink, 0.3), minor: alpha(O.ink, 0.09), hi: O.ink,
      keyBg: O.ink, keyFg: O.paper, keyHi: O.accent, hovBg: O.paper, hovFg: O.ink },
    viewer: { bg: O.ink, fg: O.paper, accent: O.paper, onAccent: O.accent },
    note: `ground ${O.ink} · line ${O.accent} · lettering ${O.paper}`,
  },
  // orange-light → a "whiteprint": paper ground, orange line work, ink lettering; the about/clients sheet is ink
  "orange-light": {
    id: "orange-light", ground: O.paper, accent: O.accent, type: O.ink,
    line: alpha(O.accent, 0.42), minor: alpha(O.accent, 0.1),
    alt: { bg: O.ink, fg: O.paper, line: alpha(O.paper, 0.22), minor: alpha(O.paper, 0.055), hi: O.accent, em: O.accent, darkLogos: false },
    slab: { bg: O.accent, fg: O.ink, line: alpha(O.ink, 0.3), minor: alpha(O.ink, 0.09), hi: O.ink,
      keyBg: O.ink, keyFg: O.paper, keyHi: O.accent, hovBg: O.paper, hovFg: O.ink },
    viewer: { bg: O.ink, fg: O.paper, accent: O.paper, onAccent: O.accent },
    note: `whiteprint ${O.paper} · line ${O.accent} · lettering ${O.ink}`,
  },
  // green → a green-ground print (like a diazo sheet): ink line work + lettering on green; ink about/clients sheet
  // with green line work; paper booking slab
  green: {
    id: "green", ground: G.accent, accent: G.ink, type: G.ink,
    line: alpha(G.ink, 0.34), minor: alpha(G.ink, 0.085),
    alt: { bg: G.ink, fg: G.paper, line: alpha(G.accent, 0.4), minor: alpha(G.accent, 0.1), hi: G.accent, em: G.accent, darkLogos: false },
    slab: { bg: G.paper, fg: G.ink, line: alpha(G.ink, 0.24), minor: alpha(G.ink, 0.07), hi: G.ink,
      keyBg: G.ink, keyFg: G.paper, keyHi: G.accent, hovBg: G.accent, hovFg: G.ink },
    viewer: { bg: G.ink, fg: G.paper, accent: G.accent, onAccent: G.ink },
    note: `green print ${G.accent} · line + lettering ${G.ink} · sheet ${G.paper}`,
  },
};

const uri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** revision-cloud outline as a border-image tile (36px, slice 12) */
export const cloud = (stroke: string) => uri(`<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36'><path fill='none' stroke='${stroke}' stroke-width='1.3' d='M12 8A6 6 0 0 1 24 8A7 7 0 0 1 28 12A6 6 0 0 1 28 24A7 7 0 0 1 24 28A6 6 0 0 1 12 28A7 7 0 0 1 8 24A6 6 0 0 1 8 12A7 7 0 0 1 12 8Z'/></svg>`);

/** very faint paper tooth */
export const tooth = uri(`<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='.1'/></svg>`);

/** the palette as CSS custom properties (set on <html>) */
export function vars(p: BlueprintPalette) {
  const v: Record<string, string> = {
    "--blue": p.accent, "--ink": p.type, "--paper": p.ground, "--p-line": p.line, "--p-minor": p.minor,
    "--a-bg": p.alt.bg, "--a-fg": p.alt.fg, "--a-line": p.alt.line, "--a-minor": p.alt.minor, "--a-hi": p.alt.hi, "--a-em": p.alt.em,
    "--s-bg": p.slab.bg, "--s-fg": p.slab.fg, "--s-line": p.slab.line, "--s-minor": p.slab.minor, "--s-hi": p.slab.hi,
    "--s-key-bg": p.slab.keyBg, "--s-key-fg": p.slab.keyFg, "--s-key-hi": p.slab.keyHi, "--s-hov-bg": p.slab.hovBg, "--s-hov-fg": p.slab.hovFg,
    "--cloud": cloud(p.alt.bg), "--tooth": tooth,
  };
  return Object.entries(v).map(([k, x]) => `${k}:${x}`).join(";");
}
