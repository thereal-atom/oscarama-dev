// Client-side helpers shared by the four opus prototypes.

export interface ClientShot {
  id: string;
  src: string;
  thumb: string;
  w: number;
  h: number;
  caption: string;
  exif: { camera: string; lens: string; aperture: string; shutter: string; iso: number };
  event: string;
  slug: string;
  client: string;
  type: string;
  date: string;
  place: string;
}

export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function readJSON<T>(id: string): T {
  return JSON.parse(document.getElementById(id)!.textContent || "null");
}

/** Binary-search the largest font-size (px) at which `el` fits inside `box` (height). */
export function fitText(el: HTMLElement, maxH: () => number, min = 16, max = 600, after?: () => void) {
  const run = () => {
    el.style.lineHeight = "";
    let lo = min,
      hi = max;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = mid + "px";
      if (el.scrollHeight <= maxH()) lo = mid;
      else hi = mid;
    }
    el.style.fontSize = Math.floor(lo * 10) / 10 + "px";
    after?.();
  };
  run();
  let w = innerWidth;
  addEventListener("resize", () => {
    // ignore mobile URL-bar height jiggle
    if (Math.abs(innerWidth - w) < 2 && matchMedia("(pointer: coarse)").matches) return;
    w = innerWidth;
    run();
  });
  document.fonts?.ready.then(run);
  return run;
}

/** Keyboard + swipe navigation for a modal viewer. */
export function viewerNav(
  root: HTMLElement,
  h: { prev: () => void; next: () => void; close: () => void; isOpen: () => boolean },
) {
  document.addEventListener("keydown", (e) => {
    if (!h.isOpen()) return;
    if (e.key === "Escape") h.close();
    else if (e.key === "ArrowRight") h.next();
    else if (e.key === "ArrowLeft") h.prev();
  });
  let sx = 0,
    sy = 0,
    st = 0;
  root.addEventListener(
    "touchstart",
    (e) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      st = Date.now();
    },
    { passive: true },
  );
  root.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Date.now() - st > 700) return;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? h.next() : h.prev();
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) h.close();
  });
}

let lockY = 0;
export function lockScroll(on: boolean) {
  const b = document.body;
  if (on) {
    lockY = scrollY;
    b.style.position = "fixed";
    b.style.top = -lockY + "px";
    b.style.left = "0";
    b.style.right = "0";
  } else {
    b.style.position = "";
    b.style.top = "";
    b.style.left = "";
    b.style.right = "";
    scrollTo(0, lockY);
  }
}

export function mailto(email: string, subject: string, lines: Array<[string, string | undefined]>) {
  const body = lines
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + "\n\n— sent from oscarama.dev/photos")}`;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.decoding = "async";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

/** Scroll velocity (px/frame, smoothed). Call `.v` each frame. */
export function scrollVelocity() {
  const s = { v: 0, last: scrollY };
  const tick = () => {
    const y = scrollY;
    s.v += (y - s.last - s.v) * 0.18;
    s.last = y;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return s;
}

export const fmtDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }).toLowerCase();
