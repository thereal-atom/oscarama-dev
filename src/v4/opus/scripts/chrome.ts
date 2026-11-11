// The gate: letterbox bars, timecode, scene tracking, scene selection and the set-up toggles.
import { clack, setSound } from "./sound";

const root = document.documentElement;

/* ---------- toggles (sound + director's commentary) ---------- */
function setToggle(name: "sound" | "commentary", on: boolean) {
  root.dataset[name] = on ? "on" : "off";
  document
    .querySelectorAll<HTMLButtonElement>(`[data-toggle="${name}"]`)
    .forEach((b) => b.setAttribute("aria-pressed", String(on)));
  if (name === "sound") setSound(on);
  if (name === "commentary") {
    try {
      localStorage.setItem("v4o-commentary", on ? "on" : "off");
    } catch {
      /* private mode */
    }
  }
}
document.querySelectorAll<HTMLButtonElement>("[data-toggle]").forEach((b) => {
  b.addEventListener("click", () => {
    const name = b.dataset.toggle as "sound" | "commentary";
    setToggle(name, root.dataset[name] !== "on");
  });
});
try {
  if (localStorage.getItem("v4o-commentary") === "on") setToggle("commentary", true);
} catch {
  /* ignore */
}

/* ---------- scene selection dialog ---------- */
const dialog = document.querySelector<HTMLDialogElement>("[data-scenes]");
document.querySelectorAll("[data-open-scenes]").forEach((b) =>
  b.addEventListener("click", () => {
    if (!dialog) return;
    dialog.showModal();
    root.classList.add("menu-open");
  })
);
dialog?.addEventListener("close", () => root.classList.remove("menu-open"));
dialog
  ?.querySelectorAll("[data-close-scenes]")
  .forEach((b) => b.addEventListener("click", () => dialog.close()));
dialog?.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
dialog?.querySelectorAll<HTMLAnchorElement>("[data-close-scenes-link]").forEach((a) =>
  a.addEventListener("click", (e) => {
    const url = new URL(a.href);
    if (url.pathname === location.pathname && url.hash) {
      e.preventDefault();
      dialog.close();
      const target = document.querySelector(url.hash);
      target?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
      history.replaceState(null, "", url.hash);
    }
  })
);

/* ---------- timecode + scene tracking ---------- */
const FPS = 24;
const PX_PER_FRAME = 6;
const tcEl = document.querySelector<HTMLElement>("[data-timecode]");
const noEl = document.querySelector<HTMLElement>("[data-scene-no]");
const titleEl = document.querySelector<HTMLElement>("[data-scene-title]");
const fill = document.querySelector<HTMLElement>("[data-strip-fill]");
const marks = [...document.querySelectorAll<HTMLElement>("[data-mark]")];
const sections = [...document.querySelectorAll<HTMLElement>("[data-scene]")];

const pad = (n: number) => String(n).padStart(2, "0");
export function timecode(frames: number) {
  const f = frames % FPS;
  const s = Math.floor(frames / FPS);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
}

let tops: number[] = [];
let maxScroll = 1;
function measure() {
  maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  tops = sections.map((s) => s.getBoundingClientRect().top + scrollY);
  marks.forEach((m) => {
    const i = sections.findIndex((s) => s.id === m.dataset.mark);
    if (i >= 0) m.style.left = `${Math.min(100, (tops[i] / maxScroll) * 100)}%`;
  });
  // stamp each chapter in the menu with its timecode
  sections.forEach((s, i) => {
    const el = document.querySelector<HTMLElement>(`.chap[href$="#${s.id}"] .chap__no`);
    if (el && !el.dataset.tc) {
      el.dataset.tc = "1";
      el.insertAdjacentHTML(
        "beforeend",
        ` <span class="chap__tc">${timecode(Math.floor(tops[i] / PX_PER_FRAME))}</span>`
      );
    }
  });
}

let current = -1;
let ticking = false;
function update() {
  ticking = false;
  const y = scrollY;
  if (tcEl) tcEl.textContent = timecode(Math.floor(y / PX_PER_FRAME));
  if (fill) fill.style.transform = `scaleX(${Math.min(1, y / maxScroll)})`;
  if (!sections.length) return;
  const probe = y + innerHeight * 0.45;
  let idx = 0;
  for (let i = 0; i < tops.length; i++) if (tops[i] <= probe) idx = i;
  if (idx !== current) {
    const prev = current;
    current = idx;
    const s = sections[idx];
    if (noEl) noEl.textContent = `sc.${s.dataset.no}`;
    if (titleEl) titleEl.textContent = s.dataset.title ?? "";
    marks.forEach((m) => m.classList.toggle("is-on", m.dataset.mark === s.id));
    if (prev !== -1) {
      clack();
      document.dispatchEvent(new CustomEvent("v4o:scene", { detail: s.id }));
    }
  }
}
const onScroll = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
};
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", () => {
  measure();
  onScroll();
});
measure();
update();
addEventListener("load", () => {
  measure();
  update();
});
// fonts shift layout a little; re-measure once they land
document.fonts?.ready.then(() => {
  measure();
  update();
});

/* ---------- slates: snap the clapstick shut when a scene enters ---------- */
const slateIO = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-clapped");
        slateIO.unobserve(e.target);
      }
    }),
  { rootMargin: "0px 0px -25% 0px" }
);
document.querySelectorAll(".slate").forEach((s) => slateIO.observe(s));

/* ---------- generic reveal ("cut in") ---------- */
const cutIO = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        cutIO.unobserve(e.target);
      }
    }),
  { rootMargin: "0px 0px -15% 0px" }
);
document.querySelectorAll("[data-cut]").forEach((s) => cutIO.observe(s));
