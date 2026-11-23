// Split-flap settle animation for every .flap on the page.
// One rAF loop drives all tiles; each tile flips through random glyphs and
// lands on its final character, staggered left-to-right and row-by-row.
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&-·→'";
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FLIP: Keyframe[] = [
  { transform: "perspective(80px) rotateX(-55deg)", filter: "brightness(1.5)" },
  { transform: "none", filter: "none" },
];

type Tile = { el: HTMLElement; final: string; flips: number; next: number };

function show(el: HTMLElement, c: string) {
  el.textContent = c === " " ? " " : c;
}

export function settle(scope: ParentNode = document) {
  if (reduce) return;
  const flaps = Array.from(scope.querySelectorAll<HTMLElement>(".flap"));
  if (!flaps.length) return;
  const now = performance.now();
  const tiles: Tile[] = [];
  flaps.forEach((flap, row) => {
    const cs = Array.from(flap.querySelectorAll<HTMLElement>(".flap__c"));
    cs.forEach((el, col) => {
      const final = el.dataset.c ?? " ";
      const blank = final === " ";
      tiles.push({
        el,
        final,
        flips: blank
          ? 2 + Math.floor(Math.random() * 3)
          : 6 + Math.floor(Math.random() * 8) + Math.floor(col / 3),
        next: now + row * 90 + col * 18 + Math.random() * 60,
      });
      show(el, GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
    });
  });

  const tick = (t: number) => {
    let live = 0;
    for (const tile of tiles) {
      if (tile.flips <= 0) continue;
      live++;
      if (t < tile.next) continue;
      tile.flips--;
      show(
        tile.el,
        tile.flips === 0 ? tile.final : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      );
      // WAAPI avoids forcing a reflow per tile per frame
      tile.el.animate(FLIP, 70);
      tile.next = t + 55 + Math.random() * 25;
    }
    if (live) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
