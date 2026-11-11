// events lobby: a small crowd that mills about and queues at whichever door you point at.
import { drawBlob, pickColour } from "./blob";

type B = {
  x: number;
  y: number;
  hx: number;
  hy: number;
  ox: number;
  oy: number;
  c: number;
  ph: number;
  fx: number;
  fy: number;
  sz: number;
  sp: number;
};

export function lobby() {
  const host = document.getElementById("lobby");
  const canvas = host?.querySelector("canvas");
  const doors = Array.from(document.querySelectorAll<HTMLElement>("[data-lobby-door]"));
  if (!host || !canvas || !doors.length) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(hover: none)").matches;

  let W = 0,
    H = 0,
    DPR = 1,
    R = 8,
    band = { t: 0, b: 0 };
  let blobs: B[] = [];
  let hot = -1;
  let t = 0;
  const mouse = { x: -1, y: -1 };

  function layout() {
    const r = host!.getBoundingClientRect();
    W = r.width;
    H = r.height;
    DPR = Math.min(2, devicePixelRatio || 1);
    canvas!.width = Math.round(W * DPR);
    canvas!.height = Math.round(H * DPR);
    R = W < 700 ? 6.5 : 9;
    const overlap = W < 760 ? 70 : 90;
    band = { t: H - overlap - (W < 700 ? 48 : 62), b: H - overlap - R * 1.6 };
    const n = W < 700 ? 26 : Math.min(64, Math.round(W / 24));
    if (blobs.length !== n) {
      blobs = Array.from({ length: n }, () => {
        const x = Math.random() * W;
        const y = band.t + Math.random() * (band.b - band.t);
        return {
          x,
          y,
          hx: x,
          hy: y,
          ox: Math.random() - 0.5,
          oy: Math.random(),
          c: pickColour(),
          ph: Math.random() * 6.28,
          fx: 0,
          fy: 1,
          sz: 0.85 + Math.random() * 0.3,
          sp: 150 + Math.random() * 130,
        };
      });
    }
    blobs.forEach((b, i) => {
      b.hx = ((i + 0.5) / blobs.length) * W * 0.96 + W * 0.02;
      b.hy = band.t + b.oy * (band.b - band.t);
    });
  }

  function target(b: B) {
    if (hot < 0) return { x: b.hx, y: b.hy };
    const hr = host!.getBoundingClientRect();
    const dr = doors[hot].getBoundingClientRect();
    const cx = dr.left - hr.left + dr.width / 2;
    return { x: cx + b.ox * Math.min(dr.width * 0.92, 300), y: b.hy };
  }

  function step(dt: number) {
    t += dt;
    for (const b of blobs) {
      const g = target(b);
      const dx = g.x - b.x,
        dy = g.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d > 2) {
        const v = Math.min(d * 4, b.sp);
        b.x += (dx / d) * v * dt;
        b.y += (dy / d) * v * dt;
        b.fx += (dx / d - b.fx) * Math.min(1, dt * 8);
        b.fy += (dy / d - b.fy) * Math.min(1, dt * 8);
        b.ph += dt * 12;
      } else {
        // idle: look at the pointer, or straight down at the doors
        let lx = 0,
          ly = 1;
        if (mouse.x >= 0) {
          const mx = mouse.x - b.x,
            my = mouse.y - b.y,
            m = Math.hypot(mx, my) || 1;
          lx = mx / m;
          ly = my / m;
        }
        b.fx += (lx - b.fx) * Math.min(1, dt * 5);
        b.fy += (ly - b.fy) * Math.min(1, dt * 5);
        b.ph += dt * 2.2;
      }
    }
  }

  function draw() {
    ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx!.clearRect(0, 0, W, H);
    const list = blobs.slice().sort((a, b) => a.y - b.y);
    for (const b of list) {
      const r = R * b.sz;
      const g = target(b);
      const moving = Math.hypot(g.x - b.x, g.y - b.y) > 2;
      const lift = moving
        ? Math.abs(Math.sin(b.ph)) * r * 0.5
        : Math.max(0, Math.sin(b.ph)) * r * 0.14;
      drawBlob(ctx!, b.x, b.y, r, b.c, b.fx, b.fy, lift, (t * 0.6 + b.ph * 7) % 9 < 0.14);
    }
  }

  let raf = 0,
    last = 0,
    onScreen = true;
  function frame(now: number) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    step(dt);
    draw();
    kick();
  }
  function kick() {
    if (raf || !onScreen || document.hidden || reduce) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  const setHot = (i: number) => {
    hot = i;
    doors.forEach((d, k) => (d.dataset.hot = k === i ? "1" : "0"));
    if (reduce) {
      for (const b of blobs) {
        const g = target(b);
        b.x = g.x;
        b.y = g.y;
      }
      draw();
    }
  };
  doors.forEach((d, i) => {
    d.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && setHot(i));
    d.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && setHot(-1));
    d.addEventListener("focus", () => setHot(i));
    d.addEventListener("blur", () => setHot(-1));
  });
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = host.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  if (coarse && !reduce) {
    // no hover on touch: the crowd tries each door in turn
    let k = -1;
    setInterval(() => {
      if (!onScreen || document.hidden) return;
      k = (k + 1) % (doors.length + 1);
      setHot(k === doors.length ? -1 : k);
    }, 2400);
  }

  document.addEventListener("visibilitychange", kick);
  new IntersectionObserver((es) => {
    onScreen = es[0].isIntersecting;
    kick();
  }).observe(host);
  new ResizeObserver(() => {
    layout();
    for (const b of blobs) b.y = b.hy;
    draw();
    kick();
  }).observe(host);

  layout();
  draw();
  kick();
  (window as any).__lobby = {
    setHot,
    step: (s: number) => {
      for (let i = 0; i < s * 60; i++) step(1 / 60);
      draw();
    },
  };
}
