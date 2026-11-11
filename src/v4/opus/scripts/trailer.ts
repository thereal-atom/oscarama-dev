// SC.02: the trailer. Scroll position picks the card (hard cuts); autoplay just jumps the scroll.
import { braam, whoosh } from "./sound";

const section = document.querySelector<HTMLElement>("[data-trailer]");
if (section) {
  const frame = section.querySelector<HTMLElement>("[data-trailer-frame]")!;
  const cards = [...section.querySelectorAll<HTMLElement>("[data-card]")];
  const ticks = [...section.querySelectorAll<HTMLElement>("[data-tick]")];
  const cardNo = section.querySelector<HTMLElement>("[data-card-no]");
  const n = cards.length;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  let top = 0;
  let span = 1;
  const measure = () => {
    top = section.getBoundingClientRect().top + scrollY;
    span = Math.max(1, section.offsetHeight - innerHeight);
  };

  let idx = -1;
  let lastFlash = 0;
  const show = (i: number, fromScroll = true) => {
    if (i === idx) return;
    const prev = idx;
    idx = i;
    cards.forEach((c, k) => c.classList.toggle("is-on", k === i));
    ticks.forEach((t, k) => t.classList.toggle("is-past", k <= i));
    if (cardNo) cardNo.textContent = String(i + 1).padStart(2, "0");
    frame.dataset.card = String(i);
    if (prev === -1) return;
    const inView = Math.abs(section.getBoundingClientRect().top) < section.offsetHeight;
    if (!inView) return;
    // at most two flash frames a second, however fast the scroll
    const now = performance.now();
    if (!reduce && now - lastFlash > 500) {
      lastFlash = now;
      frame.classList.remove("is-flash");
      void frame.offsetWidth;
      frame.classList.add("is-flash");
    }
    if (i === 1 || i === n - 1) braam();
    else if (fromScroll || playing) whoosh();
  };

  const fromScroll = () => {
    const p = (scrollY - top) / span;
    show(Math.min(n - 1, Math.max(0, Math.floor(p * n))));
  };

  let ticking = false;
  addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        fromScroll();
      });
    },
    { passive: true }
  );
  addEventListener("resize", () => {
    measure();
    fromScroll();
  });
  measure();
  fromScroll();
  addEventListener("load", measure);
  document.fonts?.ready.then(measure);

  /* ---------- autoplay: hold each card, then cut by jumping the scroll ---------- */
  let playing = false;
  let timer = 0;
  const posFor = (i: number) => top + ((i + 0.5) / n) * span;
  const hold = (i: number) => (i === 0 ? 3200 : 2300);

  const stop = () => {
    if (!playing) return;
    playing = false;
    clearTimeout(timer);
    root.classList.remove("trailer-playing");
  };
  const step = (i: number) => {
    measure();
    scrollTo({ top: posFor(i), behavior: "instant" as ScrollBehavior });
    show(i, false);
    if (i >= n - 1) {
      timer = window.setTimeout(stop, 2500);
      return;
    }
    timer = window.setTimeout(() => step(i + 1), hold(i));
  };
  const play = () => {
    if (playing) return stop();
    playing = true;
    root.classList.add("trailer-playing");
    const p = (scrollY - top) / span;
    const startAt = p >= 0 && p < 1 && idx < n - 1 ? idx : 0;
    step(startAt);
  };

  document.querySelectorAll("[data-play-trailer]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      play();
    })
  );
  const cancel = () => stop();
  addEventListener("wheel", cancel, { passive: true });
  addEventListener("touchstart", cancel, { passive: true });
  addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" ||
      e.key.startsWith("Arrow") ||
      e.key === "PageDown" ||
      e.key === "PageUp" ||
      e.key === " "
    )
      stop();
  });
  document.addEventListener("pointerdown", (e) => {
    if (!(e.target as HTMLElement).closest("[data-play-trailer]")) stop();
  });
}
