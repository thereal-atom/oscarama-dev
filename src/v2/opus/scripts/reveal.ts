// Adds .is-in to [data-reveal] elements as they enter the viewport.
// Elements already on screen at load reveal immediately (with their stagger).
const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduce || !("IntersectionObserver" in window)) {
  els.forEach((el) => el.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
  );
  els.forEach((el) => io.observe(el));
}
