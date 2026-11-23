// Build-time terrain generator for /v2/opus.
// Everything here runs in Astro frontmatter, so the output ships as plain SVG
// path data: no client JS, no canvas, crisp at any size.

/** Small deterministic PRNG so the terrain is stable between builds. */
export function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Classic 2D gradient (Perlin) noise with a seeded permutation table. */
function makePerlin(seed: number) {
  const rand = mulberry32(seed);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const grad = (h: number, x: number, y: number) => {
    switch (h & 7) {
      case 0:
        return x + y;
      case 1:
        return -x + y;
      case 2:
        return x - y;
      case 3:
        return -x - y;
      case 4:
        return x;
      case 5:
        return -x;
      case 6:
        return y;
      default:
        return -y;
    }
  };
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  return (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    );
  };
}

type Pt = [number, number];

export interface ContourOptions {
  seed?: number;
  width?: number;
  height?: number;
  /** grid cell size in viewBox units */
  cell?: number;
  levels?: number;
  /** noise frequency (lower = broader hills) */
  scale?: number;
  octaves?: number;
  /** optional radial "peak" to push a summit somewhere: [cx, cy, radius, strength] in 0..1 units */
  peak?: [number, number, number, number];
}

export interface ContourResult {
  width: number;
  height: number;
  /** one SVG path `d` per level, lowest level first; `parts` are the individual loops */
  levels: {
    d: string;
    level: number;
    index: number;
    parts: { d: string; cx: number; cy: number }[];
  }[];
  /** position of the highest point, in viewBox units */
  summit: Pt;
}

/**
 * Generates topographic contour lines via fractal noise + marching squares.
 * Segments are stitched into polylines by their shared grid edges and then
 * smoothed with midpoint quadratics, which keeps the path data compact.
 */
export function contours(opts: ContourOptions = {}): ContourResult {
  const {
    seed = 7,
    width = 1440,
    height = 900,
    cell = 22,
    levels = 14,
    scale = 0.0021,
    octaves = 4,
    peak,
  } = opts;

  const noise = makePerlin(seed);
  const nx = Math.ceil(width / cell) + 1;
  const ny = Math.ceil(height / cell) + 1;
  const field = new Float32Array(nx * ny);
  let min = Infinity;
  let max = -Infinity;
  let summit: Pt = [0, 0];

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = i * cell;
      const y = j * cell;
      let amp = 1;
      let freq = scale;
      let v = 0;
      for (let o = 0; o < octaves; o++) {
        v += amp * noise(x * freq + seed * 13.1, y * freq - seed * 7.7);
        amp *= 0.5;
        freq *= 2.03;
      }
      if (peak) {
        const [cx, cy, r, s] = peak;
        const dx = x / width - cx;
        const dy = (y / height - cy) * (height / width);
        const d = Math.sqrt(dx * dx + dy * dy) / r;
        v += s * Math.exp(-d * d);
      }
      field[j * nx + i] = v;
      if (v < min) min = v;
      if (v > max) {
        max = v;
        summit = [x, y];
      }
    }
  }

  const out: ContourResult["levels"] = [];
  for (let l = 0; l < levels; l++) {
    const level = min + ((l + 1) / (levels + 1)) * (max - min);
    const parts = traceLevel(field, nx, ny, cell, level);
    if (parts.length) out.push({ d: parts.map((p) => p.d).join(""), parts, level, index: l });
  }
  return { width, height, levels: out, summit };
}

function traceLevel(field: Float32Array, nx: number, ny: number, cell: number, level: number) {
  // Edge keys: horizontal edge (i,j)->(i+1,j) = "h" ; vertical edge (i,j)->(i,j+1) = "v"
  const pts = new Map<string, Pt>();
  const adj = new Map<string, string[]>();
  const v = (i: number, j: number) => field[j * nx + i];

  const edgePoint = (key: string, a: Pt, b: Pt, va: number, vb: number) => {
    if (!pts.has(key)) {
      const t = (level - va) / (vb - va || 1e-9);
      pts.set(key, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
    return key;
  };
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  };

  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const tl = v(i, j);
      const tr = v(i + 1, j);
      const br = v(i + 1, j + 1);
      const bl = v(i, j + 1);
      const idx =
        (tl >= level ? 8 : 0) |
        (tr >= level ? 4 : 0) |
        (br >= level ? 2 : 0) |
        (bl >= level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;

      const x0 = i * cell;
      const y0 = j * cell;
      const x1 = x0 + cell;
      const y1 = y0 + cell;
      const top = () => edgePoint(`h${i},${j}`, [x0, y0], [x1, y0], tl, tr);
      const right = () => edgePoint(`v${i + 1},${j}`, [x1, y0], [x1, y1], tr, br);
      const bottom = () => edgePoint(`h${i},${j + 1}`, [x0, y1], [x1, y1], bl, br);
      const left = () => edgePoint(`v${i},${j}`, [x0, y0], [x0, y1], tl, bl);
      const center = (tl + tr + br + bl) / 4;

      switch (idx) {
        case 1:
        case 14:
          link(left(), bottom());
          break;
        case 2:
        case 13:
          link(bottom(), right());
          break;
        case 3:
        case 12:
          link(left(), right());
          break;
        case 4:
        case 11:
          link(top(), right());
          break;
        case 6:
        case 9:
          link(top(), bottom());
          break;
        case 7:
        case 8:
          link(left(), top());
          break;
        case 5:
          if (center >= level) {
            link(left(), top());
            link(bottom(), right());
          } else {
            link(left(), bottom());
            link(top(), right());
          }
          break;
        case 10:
          if (center >= level) {
            link(top(), right());
            link(left(), bottom());
          } else {
            link(left(), top());
            link(bottom(), right());
          }
          break;
      }
    }
  }

  // Walk the adjacency graph into polylines.
  const seen = new Set<string>();
  const lines: { pts: Pt[]; closed: boolean }[] = [];
  const walk = (start: string) => {
    const chain = [start];
    seen.add(start);
    let cur = start;
    for (;;) {
      const next = (adj.get(cur) || []).find((n) => !seen.has(n));
      if (!next) break;
      seen.add(next);
      chain.push(next);
      cur = next;
    }
    return chain;
  };
  // open chains first (endpoints have a single neighbour)
  for (const [key, ns] of adj) {
    if (ns.length === 1 && !seen.has(key)) {
      lines.push({ pts: walk(key).map((k) => pts.get(k)!), closed: false });
    }
  }
  for (const key of adj.keys()) {
    if (!seen.has(key)) {
      lines.push({ pts: walk(key).map((k) => pts.get(k)!), closed: true });
    }
  }

  return lines
    .filter((l) => l.pts.length > 3)
    .map((l) => {
      const cx = l.pts.reduce((s, p) => s + p[0], 0) / l.pts.length;
      const cy = l.pts.reduce((s, p) => s + p[1], 0) / l.pts.length;
      return { d: smoothPath(simplify(l.pts, cell * 0.35), l.closed), cx, cy };
    })
    .filter((p) => p.d);
}

function simplify(pts: Pt[], minDist: number) {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const last = out[out.length - 1];
    if (Math.hypot(pts[i][0] - last[0], pts[i][1] - last[1]) >= minDist) out.push(pts[i]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// whole units are plenty at these sizes (1 unit ≈ 1 css px) and keep the path data small
const r = (n: number) => Math.round(n);

/** Quadratic curves through midpoints: smooth, compact, and passes near every vertex. */
function smoothPath(p: Pt[], closed: boolean) {
  if (p.length < 3) return "";
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (closed) {
    const m0 = mid(p[p.length - 1], p[0]);
    let d = `M${r(m0[0])} ${r(m0[1])}`;
    for (let i = 0; i < p.length; i++) {
      const c = p[i];
      const m = mid(c, p[(i + 1) % p.length]);
      d += `Q${r(c[0])} ${r(c[1])} ${r(m[0])} ${r(m[1])}`;
    }
    return d + "Z";
  }
  let d = `M${r(p[0][0])} ${r(p[0][1])}`;
  for (let i = 1; i < p.length - 1; i++) {
    const m = mid(p[i], p[i + 1]);
    d += `Q${r(p[i][0])} ${r(p[i][1])} ${r(m[0])} ${r(m[1])}`;
  }
  const e = p[p.length - 1];
  return d + `L${r(e[0])} ${r(e[1])}`;
}

export interface RidgeOptions {
  seed?: number;
  width?: number;
  height?: number;
  /** 0..1, where the ridge line sits on average (fraction of height from top) */
  base?: number;
  /** amplitude as a fraction of height */
  amp?: number;
  /** 0..1, higher = more jagged */
  rough?: number;
  /** power of two */
  segments?: number;
}

/**
 * Mountain ridge silhouette via 1D midpoint displacement.
 * Returns a closed polygon path plus the summit point (for planting flags).
 */
export function ridge(opts: RidgeOptions = {}) {
  const {
    seed = 3,
    width = 1440,
    height = 320,
    base = 0.45,
    amp = 0.38,
    rough = 0.56,
    segments = 128,
  } = opts;
  const rand = mulberry32(seed);
  const ys = new Array(segments + 1).fill(0);
  ys[0] = rand() - 0.5;
  ys[segments] = rand() - 0.5;
  let step = segments;
  let a = 1;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < segments; i += step) {
      ys[i] = (ys[i - half] + ys[i + half]) / 2 + (rand() - 0.5) * a;
    }
    a *= rough;
    step = half;
  }
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  let peak: Pt = [0, height];
  const pts = ys.map((y, i) => {
    // sharpen peaks, flatten valleys
    const n = Math.pow((y - lo) / (hi - lo || 1), 1.35); // 0..1, 1 = peak
    const p: Pt = [r((i / segments) * width), r(height * (base + amp * (0.5 - n)))];
    if (p[1] < peak[1]) peak = p;
    return p;
  });
  const d = `M0 ${height}L${pts.map((p) => `${p[0]} ${p[1]}`).join("L")}L${width} ${height}Z`;
  return { d, peak };
}
