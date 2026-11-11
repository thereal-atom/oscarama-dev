// The Concise Oscarama: client behaviour.
// Everything here is progressive enhancement; the pages read fine without it.

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) =>
  r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [
  ...r.querySelectorAll<T>(s),
];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const fontsReady: Promise<unknown> = Promise.race([
  Promise.all([document.fonts?.load("900 100px Anybody"), document.fonts?.ready]).catch(() => null),
  new Promise((r) => setTimeout(r, 2500)),
]);

/* ───────────── fit-to-width type ─────────────
   Sizes an element so its single line spans its parent's content box. */
function contentWidth(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
}
function fitTo(el: HTMLElement, avail: number, max = Infinity) {
  el.style.fontSize = "100px";
  const w = el.scrollWidth || el.getBoundingClientRect().width;
  if (!w) return;
  el.style.fontSize = `${Math.min(max, (100 * avail) / w).toFixed(2)}px`;
}
const fitters: (() => void)[] = [];
function fitAll() {
  fitters.forEach((f) => f());
}

function setupFits() {
  $$("[data-fit]").forEach((el) => {
    // data-fit may carry a factor (e.g. "0.93" leaves room for a skewed word)
    const k = Number(el.dataset.fit) || 0.995;
    fitters.push(() => fitTo(el, contentWidth(el.parentElement!) * k));
  });
  $$("[data-fit-lines]").forEach((block) => {
    const lines = $$(":scope > span", block);
    fitters.push(() => {
      const avail = contentWidth(block);
      lines.forEach((l) => fitTo(l, avail * 0.995));
    });
  });
}

/* ───────────── 1. the headword accordion ─────────────
   Letters swell toward the cursor while the word keeps (roughly) its width:
   the mean width-axis value is conserved, so neighbours slim down. */
function headword() {
  const h1 = $("[data-headword]");
  const row = $("[data-hw-row]");
  if (!h1 || !row) return;
  const letters = $$(".l", row);
  const segs = $$(".hw-seg", row);
  const group = letters.map((l) => segs.indexOf(l.parentElement as HTMLElement));
  const n = letters.length;
  const BASE = 80;
  const MIN = 50;
  const MAX = 150;
  const cur = letters.map(() => (reduce ? BASE : MIN));
  const wt = letters.map(() => 900);
  let pointerU: number | null = null;
  let lastMove = 0;
  let visible = true;
  let raf = 0;
  const t0 = performance.now();

  const apply = () => {
    letters.forEach((l, i) => {
      l.style.setProperty("--w", cur[i].toFixed(1));
      l.style.setProperty("--g", wt[i].toFixed(0));
    });
  };

  const fit = () => {
    const stacked = getComputedStyle(row).flexDirection === "column";
    const saved = cur.slice();
    letters.forEach((l) => l.style.setProperty("--w", String(BASE)));
    h1.style.fontSize = "100px";
    const widths = segs.map((sg) => sg.getBoundingClientRect().width);
    const w = stacked ? Math.max(...widths) : widths.reduce((a, b) => a + b, 0);
    const avail = contentWidth(h1) * (stacked ? 0.92 : 0.97);
    h1.style.fontSize = `${Math.min(420, (100 * avail) / w).toFixed(2)}px`;
    saved.forEach((v, i) => letters[i].style.setProperty("--w", v.toFixed(1)));
  };
  fitters.push(fit);

  if (reduce) {
    apply();
    return;
  }

  const targets = (now: number) => {
    const t = (now - t0) / 1000;
    let u: number | null = pointerU;
    // idle: the word "pronounces itself", a slow sweep that lingers on the stressed syllable
    if (u === null || now - lastMove > 2600) {
      if (t < 1.1) return letters.map((_, i) => (t > 0.12 + i * 0.07 ? BASE : MIN));
      u = (Math.sin((t - 1.1) * 0.55 - Math.PI / 2) * 0.5 + 0.5) * (n - 1);
    }
    const sigma = 1.05;
    const g = letters.map((_, i) => Math.exp(-((i - u!) ** 2) / (2 * sigma * sigma)));
    const raw = g.map((v) => BASE + (MAX - BASE) * v * 1.05);
    // conserve the mean width per segment so each line keeps its length
    const shift = segs.map((_, si) => {
      const vals = raw.filter((_, i) => group[i] === si);
      return BASE - vals.reduce((a, b) => a + b, 0) / vals.length;
    });
    return raw.map((v, i) => clamp(v + shift[group[i]], MIN, MAX));
  };

  const tick = (now: number) => {
    raf = 0;
    const tg = targets(now);
    let moving = false;
    for (let i = 0; i < n; i++) {
      const d = tg[i] - cur[i];
      cur[i] += d * 0.14;
      wt[i] = 760 + 140 * ((cur[i] - MIN) / (MAX - MIN));
      if (Math.abs(d) > 0.05) moving = true;
    }
    apply();
    if (visible && (moving || pointerU !== null || now - t0 < 30000))
      raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (!raf && visible) raf = requestAnimationFrame(tick);
  };

  const hero = h1.closest("section")!;
  if (finePointer) {
    hero.addEventListener("pointermove", (e) => {
      const r = row.getBoundingClientRect();
      pointerU = clamp((e.clientX - r.left) / r.width, 0, 0.999) * n - 0.5;
      lastMove = performance.now();
      kick();
    });
    hero.addEventListener("pointerleave", () => {
      pointerU = null;
      lastMove = 0;
      kick();
    });
  }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    kick();
  }).observe(h1);
  kick();
}

/* ───────────── 2. highlighter ───────────── */
function highlighter() {
  const marks = $$("mark.hl");
  if (reduce || !("IntersectionObserver" in window)) {
    marks.forEach((m) => m.classList.add("on"));
    return;
  }
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        setTimeout(() => el.classList.add("on"), 120);
        io.unobserve(el);
      }),
    { rootMargin: "0px 0px -18% 0px", threshold: 1 }
  );
  marks.forEach((m) => io.observe(m));
}

/* ───────────── 3. breathing letters (scroll-linked width axis) ───────────── */
const scrollJobs: (() => void)[] = [];
function breathing() {
  if (reduce) return;
  const els = $$("[data-breathe]");
  const vis = new Set<HTMLElement>();
  const io = new IntersectionObserver((es) =>
    es.forEach((e) => {
      const el = e.target as HTMLElement;
      if (e.isIntersecting) vis.add(el);
      else vis.delete(el);
    })
  );
  els.forEach((el) => io.observe(el));
  scrollJobs.push(() => {
    const vh = innerHeight;
    vis.forEach((el) => {
      const r = el.getBoundingClientRect();
      const c = r.top + r.height / 2;
      const p = 1 - clamp(Math.abs(c - vh * 0.48) / (vh * 0.55));
      const min = Number(el.dataset.min ?? 50);
      const max = Number(el.dataset.max ?? 150);
      el.style.setProperty("--w", (min + (max - min) * easeInOut(p)).toFixed(1));
    });
  });
}

/* ───────────── 4. zero → agent: a transfer of mass ───────────── */
function zeroToAgent() {
  const z = $("[data-z]");
  if (!z) return;
  const a = $(".z-a", z)!;
  const b = $(".z-b", z)!;
  const set = (p: number) => {
    a.style.setProperty("--w", (150 - 100 * p).toFixed(1));
    b.style.setProperty("--w", (50 + 100 * p).toFixed(1));
  };
  fitters.push(() => {
    z.style.fontSize = "100px";
    const measure = () => a.getBoundingClientRect().width + b.getBoundingClientRect().width;
    set(0);
    const w0 = measure();
    set(1);
    const w1 = measure();
    const avail = contentWidth(z);
    const fs = (100 * avail) / (Math.max(w0, w1) + 100 * (0.9 + 0.28) + 6);
    z.style.fontSize = `${Math.min(fs, 300).toFixed(2)}px`;
    set(reduce ? 0.5 : 0);
    if (!reduce) scrollJobs.forEach((j) => j());
  });
  if (reduce) return;
  scrollJobs.push(() => {
    const r = z.getBoundingClientRect();
    const vh = innerHeight;
    if (r.bottom < -200 || r.top > vh + 200) return;
    set(easeInOut(clamp((vh * 0.92 - r.top) / (vh * 0.7))));
  });
}

/* ───────────── 5. running head, guide words & thumb index ───────────── */
function runningHead() {
  const wordsEl = $("[data-rh-words]");
  const letterEl = $("[data-rh-letter]");
  const rh = $("[data-rh]");
  if (!wordsEl || !rh) return;
  if (!$(".entry[data-hw]")) return;
  const sections = $$("[data-guide], .page");
  const tabs = new Map($$("[data-ti]").map((t) => [t.dataset.ti!, t]));
  let lastText = "";
  let lastLetter = "";
  scrollJobs.push(() => {
    const vh = innerHeight;
    const top = rh.getBoundingClientRect().bottom;
    const mid = vh * 0.45;
    const sec = sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= mid && r.bottom >= mid;
    });
    let text = "";
    let L = "";
    if (sec?.classList.contains("page")) {
      const vis = $$(".entry[data-hw]", sec).filter((e) => {
        const r = e.getBoundingClientRect();
        return r.bottom > top + 8 && r.top < vh - 8;
      });
      if (vis.length) text = `${vis[0].dataset.hw} — ${vis[vis.length - 1].dataset.hw}`;
      $$("[data-letter]", sec).forEach((el, i) => {
        if (i === 0 || el.getBoundingClientRect().top < vh * 0.55) L = el.dataset.letter!;
      });
    } else {
      text = sec?.dataset.guide ?? lastText;
    }
    if (text !== lastText) {
      wordsEl.textContent = text;
      lastText = text;
    }
    if (L !== lastLetter) {
      if (letterEl) letterEl.textContent = L;
      tabs.get(lastLetter)?.classList.remove("is-on");
      tabs.get(L)?.classList.add("is-on");
      lastLetter = L;
    }
  });
}

/* ───────────── 6. fig. 1: a riso halftone with a developing loupe ───────────── */
function figure() {
  const fig = $("[data-fig]");
  if (!fig) return;
  const img = $<HTMLImageElement>(".fig1-img", fig)!;
  const cv = $<HTMLCanvasElement>(".fig1-dots", fig)!;
  const frame = $(".fig1-frame", fig)!;
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue("--ink").trim() || "#1f2fff";
  const pink = css.getPropertyValue("--pink").trim() || "#ff5fcd";

  const draw = () => {
    const size = frame.clientWidth;
    if (!size || !img.naturalWidth) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(size * dpr);
    cv.height = Math.round(size * dpr);
    const S = 200;
    const off = document.createElement("canvas");
    off.width = off.height = S;
    const o = off.getContext("2d", { willReadFrequently: true });
    if (!o) return;
    o.drawImage(img, 0, 0, S, S);
    let px: Uint8ClampedArray;
    try {
      px = o.getImageData(0, 0, S, S).data;
    } catch {
      return;
    }
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    // two channels, auto-levelled: darkness → blue screen, warmth → pink screen
    const lum = new Float32Array(S * S);
    const warm = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) {
      const r = px[i * 4];
      const g = px[i * 4 + 1];
      const b = px[i * 4 + 2];
      lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      warm[i] = (r - (g + b) / 2) / 255;
    }
    const q = (a: Float32Array, p: number) => {
      const c = Float32Array.from(a).sort();
      return c[Math.floor(p * (c.length - 1))];
    };
    const lHi = q(lum, 0.88);
    const lLo = q(lum, 0.03);
    const wLo = q(warm, 0.62);
    const wHi = q(warm, 0.985);
    const idx = (x: number, y: number) =>
      clamp(Math.floor((y / size) * S), 0, S - 1) * S + clamp(Math.floor((x / size) * S), 0, S - 1);
    const passes = [
      {
        color: pink,
        angle: (15 * Math.PI) / 180,
        cell: size / 46,
        v: (i: number) => clamp((warm[i] - wLo) / (wHi - wLo || 1)) ** 1.25,
      },
      {
        color: ink,
        angle: (45 * Math.PI) / 180,
        cell: size / 56,
        v: (i: number) => clamp(((lHi - lum[i]) / (lHi - lLo || 1) - 0.22) * 1.3) ** 0.85,
      },
    ];
    ctx.globalCompositeOperation = "multiply";
    for (const p of passes) {
      const c = Math.cos(p.angle);
      const s = Math.sin(p.angle);
      const R = size * 0.75;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      for (let i = -R; i < R; i += p.cell) {
        for (let j = -R; j < R; j += p.cell) {
          const x = size / 2 + i * c - j * s;
          const y = size / 2 + i * s + j * c;
          if (x < -p.cell || y < -p.cell || x > size + p.cell || y > size + p.cell) continue;
          const rad = p.cell * 0.62 * Math.sqrt(p.v(idx(x, y)));
          if (rad < 0.3) continue;
          ctx.moveTo(x + rad, y);
          ctx.arc(x, y, rad, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    }
    fig.classList.add("is-ht");
  };

  const start = () => {
    draw();
    let t = 0;
    new ResizeObserver(() => {
      clearTimeout(t);
      t = window.setTimeout(draw, 150);
    }).observe(frame);
  };
  if (img.complete && img.naturalWidth) start();
  else img.addEventListener("load", start, { once: true });

  // the loupe
  let x = 0,
    y = 0,
    r = 0,
    tx = 0,
    ty = 0,
    tr = 0,
    raf = 0,
    developed = false;
  const write = () => {
    fig.style.setProperty("--x", `${x.toFixed(1)}px`);
    fig.style.setProperty("--y", `${y.toFixed(1)}px`);
    fig.style.setProperty("--r", `${Math.max(0, r).toFixed(1)}px`);
  };
  const tick = () => {
    raf = 0;
    const k = reduce ? 1 : 0.22;
    x += (tx - x) * k;
    y += (ty - y) * k;
    r += (tr - r) * (reduce ? 1 : 0.16);
    write();
    if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tr - r) > 0.3)
      raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const local = (e: PointerEvent) => {
    const b = frame.getBoundingClientRect();
    return [e.clientX - b.left, e.clientY - b.top];
  };
  frame.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    [tx, ty] = local(e);
    if (r < 1) [x, y] = [tx, ty];
    tr = frame.clientWidth * 0.22;
    fig.classList.add("is-hover");
    kick();
  });
  frame.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    [tx, ty] = local(e);
    kick();
  });
  frame.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    tr = 0;
    fig.classList.remove("is-hover");
    kick();
  });
  frame.addEventListener("pointerup", (e) => {
    if (e.pointerType === "mouse") return;
    developed = !developed;
    [tx, ty] = local(e);
    [x, y] = [tx, ty];
    tr = developed ? frame.clientWidth * 1.5 : 0;
    kick();
  });
}

/* ───────────── 7. a–z overlay & open-at-random ───────────── */
function azOverlay() {
  const az = $("[data-az]");
  const openBtn = $("[data-az-open]");
  if (!az || !openBtn) return;
  // everything behind the overlay goes inert while it is open
  const behind = $$("body > *").filter((el) => el !== az && el.tagName !== "SCRIPT");
  const setInert = (on: boolean) => behind.forEach((el) => el.toggleAttribute("inert", on));
  const open = () => {
    az.hidden = false;
    openBtn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("az-open");
    setInert(true);
    $<HTMLElement>("a, button", az)?.focus();
  };
  const close = (focus = true) => {
    az.hidden = true;
    openBtn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("az-open");
    setInert(false);
    if (focus) openBtn.focus();
  };
  openBtn.addEventListener("click", open);
  $("[data-az-close]", az)?.addEventListener("click", () => close());
  $$("[data-az-link]", az).forEach((l) => l.addEventListener("click", () => close(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !az.hidden) close();
  });
}

function randomEntry() {
  const ids = $$(".entry[id]").map((e) => e.id);
  if (!ids.length) return;
  $$("[data-random]").forEach((b) =>
    b.addEventListener("click", () => {
      let id = ids[Math.floor(Math.random() * ids.length)];
      if (`#${id}` === location.hash) id = ids[(ids.indexOf(id) + 1) % ids.length];
      location.hash = id;
    })
  );
}

/* ───────────── 8. reveals ───────────── */
function reveals() {
  const els = $$("[data-reveal]");
  if (reduce) {
    els.forEach((e) => e.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.35 }
  );
  els.forEach((e) => io.observe(e));
}

/* ───────────── boot ───────────── */
setupFits();
headword();
highlighter();
breathing();
zeroToAgent();
runningHead();
figure();
azOverlay();
randomEntry();
reveals();

let scrollRaf = 0;
const onScroll = () => {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    scrollJobs.forEach((j) => j());
  });
};
addEventListener("scroll", onScroll, { passive: true });

fitAll();
onScroll();
fontsReady.then(() => {
  fitAll();
  document.documentElement.classList.add("fonts-in");
  onScroll();
});
let resizeT = 0;
addEventListener("resize", () => {
  clearTimeout(resizeT);
  resizeT = window.setTimeout(() => {
    fitAll();
    onScroll();
  }, 120);
});
