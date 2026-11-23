/**
 * the wall: a pegboard you pan around.
 *
 * - camera: drag / wheel / arrow keys / dock / minimap move a big transformed world
 * - hang:   everything on a hook is a damped pendulum. drag it, throw it, it re-hooks
 *           on the nearest peg hole and swings until it settles
 * - drone:  a small quadcopter that trails the cursor, or parks on its pad
 *
 * on narrow screens (and on the plain /events pages) the camera is off and the same
 * markup is a normal scrolling column; things still swing.
 */

const W = 3600;
const H = 2400;
const GRID = 40;
const OFF = 20;
const G = 3000;
const DEG = 180 / Math.PI;

const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
const wideMq = matchMedia("(min-width: 861px)");

const capture = (el: Element, id: number) => {
  try {
    el.setPointerCapture(id);
  } catch {
    /* synthetic or already-released pointer */
  }
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const snap = (v: number) => Math.round((v - OFF) / GRID) * GRID + OFF;

interface Item {
  el: HTMLElement;
  fixed: boolean;
  rest: number;
  /** pin position in world px, before any dragging */
  px: number;
  py: number;
  w: number;
  h: number;
  len: number;
  dx: number;
  dy: number;
  homeDx: number;
  homeDy: number;
  tdx: number | null;
  tdy: number | null;
  a: number;
  om: number;
  vx: number;
  lastDx: number;
  held: boolean;
  awake: boolean;
  visible: boolean;
  sign: number;
  dot?: HTMLElement;
}

function makeItems(root: ParentNode): Item[] {
  return [...root.querySelectorAll<HTMLElement>("[data-hang]")].map((el, i) => ({
    el,
    fixed: el.hasAttribute("data-fixed"),
    rest: parseFloat(el.style.getPropertyValue("--rest")) || 0,
    px: 0,
    py: 0,
    w: 0,
    h: 0,
    len: 200,
    dx: 0,
    dy: 0,
    homeDx: 0,
    homeDy: 0,
    tdx: null,
    tdy: null,
    a: 0,
    om: 0,
    vx: 0,
    lastDx: 0,
    held: false,
    awake: false,
    visible: true,
    sign: i % 2 ? 1 : -1,
  }));
}

function writeItem(it: Item) {
  it.el.style.setProperty("--a", `${(it.rest + it.a * DEG).toFixed(2)}deg`);
}

/** one pendulum step. extAx = sideways acceleration of the hook in px/s² */
function swing(it: Item, dt: number, extAx: number, maxA = 1.05) {
  if (it.fixed) return;
  const ax = clamp(extAx, -14000, 14000);
  if (!it.awake && Math.abs(ax) < 40) return;
  it.awake = true;
  it.om += ((ax / it.len) * Math.cos(it.a) - (G / it.len) * Math.sin(it.a)) * dt;
  it.om *= Math.exp(-dt * (it.held ? 3.2 : 1.5));
  it.a = clamp(it.a + it.om * dt, -maxA, maxA);
  if (Math.abs(it.a) === maxA) it.om *= 0.5;
  if (!it.held && it.tdx === null && Math.abs(it.a) < 0.0012 && Math.abs(it.om) < 0.004) {
    it.a = 0;
    it.om = 0;
    it.awake = false;
  }
  writeItem(it);
}

function kick(it: Item, om: number) {
  if (it.fixed) return;
  it.om = clamp(it.om + om, -4, 4);
  it.awake = true;
}

function breeze(items: Item[]) {
  const byEl = new Map(items.map((it) => [it.el, it]));
  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse" || e.buttons || reduceMq.matches) return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-hang]");
      const it = el && byEl.get(el);
      if (!it || it.fixed) return;
      const r = it.el.getBoundingClientRect();
      const rel = clamp((e.clientY - r.top) / Math.max(1, r.height), 0, 1);
      kick(it, -clamp(e.movementX, -40, 40) * 0.006 * rel);
    },
    { passive: true }
  );
}

function scrollSway(items: Item[]) {
  let last = scrollY;
  addEventListener(
    "scroll",
    () => {
      const d = clamp(scrollY - last, -80, 80);
      last = scrollY;
      if (reduceMq.matches) return;
      for (const it of items) if (it.visible) kick(it, d * 0.0016 * it.sign);
    },
    { passive: true }
  );
  if ("IntersectionObserver" in window) {
    const byEl = new Map(items.map((it) => [it.el, it]));
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        const it = byEl.get(en.target as HTMLElement);
        if (it) it.visible = en.isIntersecting;
      }
    });
    items.forEach((it) => io.observe(it.el));
  }
}

function settleIn(items: Item[]) {
  if (reduceMq.matches) return;
  items.forEach((it, i) => kick(it, (0.35 + ((i * 37) % 10) / 22) * it.sign * 0.5));
}

/** plain scrolling pages: no camera, things just swing */
export function initSwing() {
  const items = makeItems(document);
  items.forEach((it) => {
    it.len = clamp(it.el.offsetHeight * 0.55, 90, 420);
  });
  breeze(items);
  scrollSway(items);
  settleIn(items);
  let t0 = performance.now();
  const frame = (t: number) => {
    const dt = Math.min(0.034, (t - t0) / 1000);
    t0 = t;
    for (const it of items) if (it.awake && it.visible) swing(it, dt, 0, 0.1);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** the big explorable wall */
export function initWall() {
  const viewport = document.querySelector<HTMLElement>(".viewport")!;
  const world = document.querySelector<HTMLElement>("[data-world]")!;
  const zones = [...document.querySelectorAll<HTMLElement>("[data-zone]")].map((el) => {
    const [x, y, w, h] = el.dataset.box!.split(",").map(Number);
    return { el, id: el.id, x, y, w, h };
  });
  const dockLinks = [...document.querySelectorAll<HTMLAnchorElement>(".dock a[data-goto]")];
  const overviewBtn = document.querySelector<HTMLButtonElement>("[data-overview]");
  const hint = document.querySelector<HTMLElement>("[data-hint]");
  const minimap = document.querySelector<HTMLElement>("[data-minimap]");
  const mmView = document.querySelector<HTMLElement>("[data-mm-view]");
  const dialog = document.querySelector<HTMLDialogElement>("[data-tldr-dialog]");
  const droneEl = document.querySelector<HTMLElement>("[data-drone]");
  const padEl = droneEl?.parentElement ?? null;
  const droneBtns = [...document.querySelectorAll<HTMLButtonElement>("[data-drone-toggle]")];

  const items = makeItems(world);
  const byEl = new Map(items.map((it) => [it.el, it]));
  let pan = false;
  let ztop = 20;

  const cam = { x: W / 2, y: H / 2, s: 1 };
  const tgt = { x: W / 2, y: H / 2, s: 1 };
  let vw = innerWidth;
  let vh = innerHeight;
  let minS = 0.3;
  let camVx = 0;
  let camAx = 0;
  let overview = false;
  let activeZone = "";
  const pointer = { x: 0, y: 0, seen: false };

  const toWorld = (cx: number, cy: number) => ({
    x: cam.x + (cx - vw / 2) / cam.s,
    y: cam.y + (cy - vh / 2) / cam.s,
  });

  function clampTgt() {
    tgt.s = clamp(tgt.s, minS, 1.3);
    const hx = vw / 2 / tgt.s;
    const hy = vh / 2 / tgt.s;
    const m = 260;
    tgt.x = hx - m > W - hx + m ? W / 2 : clamp(tgt.x, hx - m, W - hx + m);
    tgt.y = hy - m > H - hy + m ? H / 2 : clamp(tgt.y, hy - m, H - hy + m);
  }

  let lastTf = "";
  function applyCam() {
    const tx = vw / 2 - cam.x * cam.s;
    const ty = vh / 2 - cam.y * cam.s;
    const tf = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${cam.s.toFixed(4)})`;
    if (tf === lastTf) return;
    lastTf = tf;
    world.style.transform = tf;
    if (mmView) {
      mmView.style.left = `${((cam.x - vw / 2 / cam.s) / W) * 100}%`;
      mmView.style.top = `${((cam.y - vh / 2 / cam.s) / H) * 100}%`;
      mmView.style.width = `${(vw / cam.s / W) * 100}%`;
      mmView.style.height = `${(vh / cam.s / H) * 100}%`;
    }
  }

  function jump() {
    cam.x = tgt.x;
    cam.y = tgt.y;
    cam.s = tgt.s;
    applyCam();
  }

  function setOverview(on: boolean) {
    overview = on;
    overviewBtn?.setAttribute("aria-pressed", String(on));
  }

  function dismissHint() {
    hint?.classList.add("gone");
  }

  function fit(z: { x: number; y: number; w: number; h: number }, instant = false) {
    const top = 58;
    const bottom = 74;
    const s = Math.min(1, vw / z.w, (vh - top - bottom) / z.h);
    tgt.s = Math.max(s, minS);
    tgt.x = z.x + z.w / 2;
    tgt.y = z.y + z.h / 2 + (bottom - top) / 2 / tgt.s;
    setOverview(false);
    clampTgt();
    if (instant || reduceMq.matches) jump();
  }

  function goto(id: string, instant = false, focus = false) {
    const z = zones.find((zz) => zz.id === id);
    if (!z) return false;
    fit(z, instant);
    if (focus) {
      const h = z.el.querySelector<HTMLElement>(".paint");
      if (h) {
        h.tabIndex = -1;
        h.focus({ preventScroll: true });
      }
    }
    return true;
  }

  function showAll() {
    tgt.x = W / 2;
    tgt.y = H / 2;
    tgt.s = minS;
    setOverview(true);
    if (reduceMq.matches) jump();
  }

  function markZone() {
    let id = "";
    if (!overview) {
      for (const z of zones) {
        if (cam.x >= z.x && cam.x <= z.x + z.w && cam.y >= z.y && cam.y <= z.y + z.h) id = z.id;
      }
    }
    if (id === activeZone) return;
    activeZone = id;
    for (const a of dockLinks) a.classList.toggle("on", a.dataset.goto === id);
  }

  /* ── items ── */

  function setPos(it: Item) {
    it.el.style.setProperty("--dx", `${it.dx.toFixed(1)}px`);
    it.el.style.setProperty("--dy", `${it.dy.toFixed(1)}px`);
  }

  function placeDot(it: Item) {
    if (!it.dot) return;
    it.dot.style.left = `${((it.px - it.w / 2 + (it.tdx ?? it.dx)) / W) * 100}%`;
    it.dot.style.top = `${((it.py + (it.tdy ?? it.dy)) / H) * 100}%`;
  }

  function measure() {
    for (const it of items) {
      it.w = it.el.offsetWidth;
      it.h = it.el.offsetHeight;
      it.px = it.el.offsetLeft + it.w / 2;
      it.py = it.el.offsetTop + 2;
      it.len = clamp(it.h * 0.55, 90, 420);
      if (it.fixed) continue;
      it.homeDx = snap(it.px) - it.px;
      it.homeDy = snap(it.py) - it.py;
      it.dx = it.homeDx;
      it.dy = it.homeDy;
      it.tdx = it.tdy = null;
      setPos(it);
    }
    if (minimap && !minimap.querySelector("b")) {
      for (const it of items) {
        const dot = document.createElement("b");
        dot.style.width = `${(it.w / W) * 100}%`;
        dot.style.height = `${(it.h / H) * 100}%`;
        const bg = getComputedStyle(it.el.querySelector(".body") ?? it.el).backgroundColor;
        if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) dot.style.background = bg;
        else dot.style.opacity = "0.25";
        minimap.insertBefore(dot, mmView);
        it.dot = dot;
      }
    }
    items.forEach(placeDot);
  }

  function release(it: Item, vx: number, vy: number) {
    it.held = false;
    it.el.classList.remove("held");
    const x = clamp(it.px + it.dx + vx * 0.14, 60, W - 60);
    const y = clamp(it.py + it.dy + vy * 0.14, 60, H - 160);
    it.tdx = snap(x) - it.px;
    it.tdy = snap(y) - it.py;
    it.awake = true;
    placeDot(it);
  }

  function tidy() {
    for (const it of items) {
      if (it.fixed) continue;
      it.tdx = it.homeDx;
      it.tdy = it.homeDy;
      it.awake = true;
      placeDot(it);
    }
    for (const s of world.querySelectorAll<HTMLElement>("[data-sticker]")) {
      s.style.transition = "transform .5s cubic-bezier(.2,1.2,.4,1)";
      s.style.removeProperty("--dx");
      s.style.removeProperty("--dy");
      setTimeout(() => (s.style.transition = ""), 550);
    }
  }

  function stepItem(it: Item, dt: number) {
    if (it.tdx !== null && it.tdy !== null && !it.held) {
      const k = reduceMq.matches ? 1 : 1 - Math.exp(-dt * 13);
      it.dx += (it.tdx - it.dx) * k;
      it.dy += (it.tdy - it.dy) * k;
      if (Math.abs(it.tdx - it.dx) < 0.3 && Math.abs(it.tdy - it.dy) < 0.3) {
        it.dx = it.tdx;
        it.dy = it.tdy;
        it.tdx = it.tdy = null;
      }
      setPos(it);
    }
    const vx = (it.dx - it.lastDx) / dt;
    it.lastDx = it.dx;
    const ax = (vx - it.vx) / dt;
    it.vx = vx;
    if (reduceMq.matches) return;
    swing(it, dt, ax * 0.55 - camAx * 0.07);
  }

  /* ── drone ── */

  const drone = { x: 0, y: 0, vx: 0, vy: 0, flying: false, ready: false };

  function padCentre() {
    return { x: (padEl?.offsetLeft ?? 0) + 75, y: (padEl?.offsetTop ?? 0) + 75 };
  }

  function setFlying(on: boolean) {
    drone.flying = on;
    droneBtns.forEach((b) => b.setAttribute("aria-pressed", String(on)));
    droneEl?.classList.toggle("parked", !on);
  }

  function stepDrone(dt: number, t: number) {
    if (!droneEl || !drone.ready) return;
    const home = padCentre();
    let tx = home.x;
    let ty = home.y - 8;
    if (drone.flying) {
      const p = pointer.seen
        ? toWorld(pointer.x + 58, pointer.y - 66)
        : toWorld(vw * 0.64, vh * 0.2);
      tx = p.x;
      ty = p.y + Math.sin(t / 420) * 5;
    }
    if (reduceMq.matches) {
      drone.x = tx;
      drone.y = ty;
      drone.vx = drone.vy = 0;
    } else {
      drone.vx += ((tx - drone.x) * 30 - drone.vx * 8) * dt;
      drone.vy += ((ty - drone.y) * 30 - drone.vy * 8) * dt;
      drone.x += drone.vx * dt;
      drone.y += drone.vy * dt;
    }
    const tilt = clamp(drone.vx * 0.018, -24, 24);
    const sc = Math.min(2.4, 1 / cam.s);
    droneEl.style.transform = `translate3d(${(drone.x - home.x).toFixed(1)}px,${(drone.y - home.y).toFixed(1)}px,0) rotate(${tilt.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
  }

  /* ── frame loop ── */

  let t0 = performance.now();
  let lastCamX = cam.x;
  function frame(t: number) {
    const dt = clamp((t - t0) / 1000, 0.001, 0.034);
    t0 = t;
    if (pan) {
      const k = reduceMq.matches ? 1 : 1 - Math.exp(-dt * 9);
      cam.x += (tgt.x - cam.x) * k;
      cam.y += (tgt.y - cam.y) * k;
      cam.s += (tgt.s - cam.s) * k;
      const v = (cam.x - lastCamX) / dt;
      lastCamX = cam.x;
      camAx = clamp((v - camVx) / dt, -9000, 9000);
      camVx = v;
      applyCam();
      markZone();
      for (const it of items) stepItem(it, dt);
      stepDrone(dt, t);
    } else {
      for (const it of items) if (it.awake && it.visible) swing(it, dt, 0, 0.1);
    }
    requestAnimationFrame(frame);
  }

  /* ── input: pan + drag ── */

  type Drag =
    | { kind: "pan"; id: number; x: number; y: number; vx: number; vy: number; t: number }
    | {
        kind: "item";
        id: number;
        it: Item;
        x: number;
        y: number;
        vx: number;
        vy: number;
        t: number;
        moved: boolean;
      }
    | { kind: "sticker"; id: number; el: HTMLElement; x: number; y: number; moved: boolean };
  let drag: Drag | null = null;
  let suppressClick = 0;

  viewport.addEventListener("pointerdown", (e) => {
    if (drag || (e.pointerType === "mouse" && e.button !== 0)) return;
    const target = e.target as Element;
    const sticker = target.closest<HTMLElement>("[data-sticker]");
    if (!pan && !sticker) return;
    const hangEl = target.closest<HTMLElement>("[data-hang]");
    const it = hangEl ? byEl.get(hangEl) : undefined;
    const now = performance.now();
    if (sticker) {
      drag = {
        kind: "sticker",
        id: e.pointerId,
        el: sticker,
        x: e.clientX,
        y: e.clientY,
        moved: false,
      };
    } else if (it && !it.fixed) {
      drag = {
        kind: "item",
        id: e.pointerId,
        it,
        x: e.clientX,
        y: e.clientY,
        vx: 0,
        vy: 0,
        t: now,
        moved: false,
      };
    } else if (!target.closest("a, button, input, label")) {
      drag = { kind: "pan", id: e.pointerId, x: e.clientX, y: e.clientY, vx: 0, vy: 0, t: now };
      viewport.classList.add("panning");
      capture(viewport, e.pointerId);
    }
  });

  viewport.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.seen = true;
    if (!drag || drag.id !== e.pointerId) return;
    const zoom = pan ? cam.s : 1;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    const now = performance.now();
    if (drag.kind === "pan") {
      const dt = Math.max(1, now - drag.t) / 1000;
      drag.vx = drag.vx * 0.6 + (dx / dt) * 0.4;
      drag.vy = drag.vy * 0.6 + (dy / dt) * 0.4;
      drag.t = now;
      drag.x = e.clientX;
      drag.y = e.clientY;
      tgt.x -= dx / cam.s;
      tgt.y -= dy / cam.s;
      clampTgt();
      cam.x = tgt.x;
      cam.y = tgt.y;
      if (overview) setOverview(false);
      dismissHint();
      return;
    }
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 5) return;
      drag.moved = true;
      capture(viewport, e.pointerId);
      dismissHint();
      if (drag.kind === "item") {
        drag.it.held = true;
        drag.it.tdx = drag.it.tdy = null;
        drag.it.el.classList.add("held");
        drag.it.el.style.zIndex = String(++ztop);
      } else {
        drag.el.classList.add("held");
        const sheet = drag.el.closest<HTMLElement>("[data-hang]");
        if (sheet) sheet.style.zIndex = String(++ztop);
      }
    }
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (drag.kind === "item") {
      const dt = Math.max(1, now - drag.t) / 1000;
      drag.vx = drag.vx * 0.6 + (dx / cam.s / dt) * 0.4;
      drag.vy = drag.vy * 0.6 + (dy / cam.s / dt) * 0.4;
      drag.t = now;
      drag.it.dx += dx / cam.s;
      drag.it.dy += dy / cam.s;
      drag.it.awake = true;
      setPos(drag.it);
    } else {
      const s = drag.el.style;
      const ox = parseFloat(s.getPropertyValue("--dx")) || 0;
      const oy = parseFloat(s.getPropertyValue("--dy")) || 0;
      s.setProperty("--dx", `${ox + dx / zoom}px`);
      s.setProperty("--dy", `${oy + dy / zoom}px`);
    }
  });

  function endDrag(e: PointerEvent) {
    if (!drag || drag.id !== e.pointerId) return;
    const d = drag;
    drag = null;
    const stale = performance.now() - ("t" in d ? d.t : 0) > 90;
    if (d.kind === "pan") {
      viewport.classList.remove("panning");
      if (!stale && !reduceMq.matches) {
        tgt.x -= (d.vx * 0.22) / cam.s;
        tgt.y -= (d.vy * 0.22) / cam.s;
        clampTgt();
      }
      return;
    }
    if (!d.moved) return;
    suppressClick = performance.now();
    if (d.kind === "item") release(d.it, stale ? 0 : d.vx, stale ? 0 : d.vy);
    else d.el.classList.remove("held");
  }
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  // a drag must not also be a click; and in the zoomed-out view a click means "take me there"
  viewport.addEventListener(
    "click",
    (e) => {
      if (performance.now() - suppressClick < 350) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (pan && cam.s < 0.62 && e.detail > 0) {
        e.preventDefault();
        e.stopPropagation();
        const p = toWorld(e.clientX, e.clientY);
        const z = zones.find(
          (zz) => p.x >= zz.x && p.x <= zz.x + zz.w && p.y >= zz.y && p.y <= zz.y + zz.h
        );
        if (z) fit(z);
        else {
          tgt.x = p.x;
          tgt.y = p.y;
          tgt.s = 1;
          setOverview(false);
          clampTgt();
        }
      }
    },
    true
  );

  viewport.addEventListener(
    "wheel",
    (e) => {
      if (!pan) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 32 : 1;
      if (e.ctrlKey || e.metaKey) {
        const before = toWorld(e.clientX, e.clientY);
        tgt.s = clamp(tgt.s * Math.exp(-e.deltaY * unit * 0.008), minS, 1.3);
        tgt.x = before.x - (e.clientX - vw / 2) / tgt.s;
        tgt.y = before.y - (e.clientY - vh / 2) / tgt.s;
        setOverview(false);
      } else {
        const sx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
        const sy = e.shiftKey && !e.deltaX ? 0 : e.deltaY;
        tgt.x += (sx * unit) / cam.s;
        tgt.y += (sy * unit) / cam.s;
        if (overview) setOverview(false);
      }
      clampTgt();
      dismissHint();
    },
    { passive: false }
  );

  world.addEventListener("dragstart", (e) => e.preventDefault());

  // focus can scroll an overflow:hidden box; the camera does that job instead
  viewport.addEventListener("scroll", () => {
    if (pan && (viewport.scrollLeft || viewport.scrollTop)) viewport.scrollTo(0, 0);
  });
  addEventListener("scroll", () => {
    if (pan && (scrollX || scrollY)) scrollTo(0, 0);
  });

  world.addEventListener("focusin", (e) => {
    if (!pan) return;
    const el = (e.target as Element).closest<HTMLElement>("[data-hang], .paint, .pad");
    if (!el) return;
    const it = byEl.get(el);
    const x = el.offsetLeft + (it?.dx ?? 0);
    const y = el.offsetTop + (it?.dy ?? 0);
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const hx = vw / 2 / tgt.s - 40;
    const hy = vh / 2 / tgt.s - 90;
    const inside =
      tgt.s > 0.62 &&
      x > tgt.x - hx &&
      x + w < tgt.x + hx &&
      y > tgt.y - hy &&
      y + Math.min(h, hy) < tgt.y + hy;
    if (inside) return;
    tgt.x = x + w / 2;
    tgt.y = y + Math.min(h, vh - 160) / 2;
    tgt.s = Math.max(tgt.s, 1);
    setOverview(false);
    clampTgt();
  });

  addEventListener("keydown", (e) => {
    if (!pan || dialog?.open || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "TEXTAREA" || tag === "SELECT") return;
    const step = 180 / cam.s;
    let used = true;
    switch (e.key) {
      case "ArrowLeft":
        tgt.x -= step;
        break;
      case "ArrowRight":
        tgt.x += step;
        break;
      case "ArrowUp":
        tgt.y -= step;
        break;
      case "ArrowDown":
        tgt.y += step;
        break;
      case "+":
      case "=":
        tgt.s *= 1.25;
        setOverview(false);
        break;
      case "-":
      case "_":
        tgt.s /= 1.25;
        break;
      case "0":
        if (overview) goto("home");
        else showAll();
        break;
      case "d":
        if (tag === "INPUT") used = false;
        else setFlying(!drone.flying);
        break;
      default: {
        const n = Number(e.key);
        if (n >= 1 && n <= zones.length && tag !== "INPUT") goto(zones[n - 1].id);
        else used = false;
      }
    }
    if (!used) return;
    e.preventDefault();
    clampTgt();
    dismissHint();
    if (reduceMq.matches) jump();
  });

  /* ── chrome ── */

  document.addEventListener("click", (e) => {
    const t = e.target as Element;
    const go = t.closest<HTMLElement>("[data-goto]");
    if (go && pan) {
      e.preventDefault();
      goto(go.dataset.goto!, false, e.detail === 0);
      history.replaceState(null, "", `#${go.dataset.goto}`);
      dismissHint();
      return;
    }
    if (t.closest("[data-tldr]")) {
      dialog?.showModal();
      return;
    }
    if (t.closest("[data-overview]")) {
      if (overview) goto(activeZone || "home");
      else showAll();
      dismissHint();
      return;
    }
    if (t.closest("[data-reset]")) {
      tidy();
      return;
    }
    if (t.closest("[data-drone-toggle]")) {
      setFlying(!drone.flying);
      return;
    }
    if (t === dialog) dialog?.close();
  });

  addEventListener("hashchange", () => {
    if (pan) goto(location.hash.slice(1));
  });

  if (minimap) {
    const move = (e: PointerEvent) => {
      const r = minimap.getBoundingClientRect();
      tgt.x = ((e.clientX - r.left) / r.width) * W;
      tgt.y = ((e.clientY - r.top) / r.height) * H;
      if (tgt.s < 0.62) tgt.s = 1;
      setOverview(false);
      clampTgt();
      dismissHint();
    };
    minimap.addEventListener("pointerdown", (e) => {
      capture(minimap, e.pointerId);
      move(e);
    });
    minimap.addEventListener("pointermove", (e) => {
      if (minimap.hasPointerCapture(e.pointerId)) move(e);
    });
  }

  /* ── modes ── */

  function resize() {
    vw = innerWidth;
    vh = innerHeight;
    minS = Math.min(vw / (W + 120), (vh - 110) / (H + 60));
    if (pan) {
      if (overview) tgt.s = minS;
      clampTgt();
    }
  }

  function setMode() {
    const next = wideMq.matches;
    if (next === pan) return;
    pan = next;
    if (pan) {
      resize();
      measure();
      const home = padCentre();
      drone.x = home.x;
      drone.y = home.y - 8;
      drone.ready = true;
      if (!goto(location.hash.slice(1), true)) goto("home", true);
    } else {
      world.style.transform = "";
      lastTf = "";
      if (droneEl) droneEl.style.transform = "";
      for (const it of items) {
        it.dx = it.dy = 0;
        it.tdx = it.tdy = null;
        it.el.style.removeProperty("--dx");
        it.el.style.removeProperty("--dy");
        it.len = clamp(it.el.offsetHeight * 0.55, 90, 420);
      }
    }
  }

  addEventListener("resize", resize);
  wideMq.addEventListener("change", setMode);
  setMode();
  breeze(items);
  scrollSway(items);
  settleIn(items);
  setFlying(false);
  if (!reduceMq.matches) setTimeout(() => pan && setFlying(true), 1500);
  setTimeout(dismissHint, 12000);
  requestAnimationFrame(frame);
}
