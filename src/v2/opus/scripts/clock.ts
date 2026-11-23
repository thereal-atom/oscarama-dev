// Live London clock for any [data-clock] element.
export function startClock() {
  const els = document.querySelectorAll<HTMLElement>("[data-clock]");
  if (!els.length) return;
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
  const tick = () => {
    const s = f.format(new Date()).toLowerCase();
    els.forEach((el) => (el.textContent = s));
  };
  tick();
  setInterval(tick, 1000);
}
