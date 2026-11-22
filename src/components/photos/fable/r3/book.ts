// Shared booking logic for the round-3b pages: an optional month calendar + "Send message" → mailto.
// Field names read from the form: kind (radio/select), need (checkboxes), date (optional native input),
// name, email, note. Nothing is sent anywhere — it opens the visitor's mail app with the message written out.

const fmt = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const list = (a: string[]) => (a.length > 1 ? a.slice(0, -1).join(", ") + " + " + a[a.length - 1] : (a[0] ?? ""));

export interface CalEls { grid: HTMLElement; title: HTMLElement; prev: HTMLButtonElement; next: HTMLButtonElement }
export interface BookOpts {
  form: HTMLFormElement;
  email: string;
  cal?: CalEls;
  nodate?: HTMLInputElement | null;
  /** live sentence preview (innerHTML) */
  say?: HTMLElement | null;
  /** status line under the button */
  sent?: HTMLElement | null;
  /** shows the picked date, e.g. next to the "when" label */
  picked?: HTMLElement | null;
}

export function wireBook(o: BookOpts) {
  const { form } = o;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let picked: Date | null = null;

  function cal() {
    const c = o.cal; if (!c) return;
    c.title.textContent = view.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    c.prev.disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
    const first = (view.getDay() + 6) % 7, days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    let h = ["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span>${d}</span>`).join("") + "<i></i>".repeat(first);
    for (let d = 1; d <= days; d++) {
      const dt = new Date(view.getFullYear(), view.getMonth(), d), on = picked && +dt === +picked;
      h += `<button type="button" data-d="${d}" ${dt < today ? "disabled" : ""} aria-pressed="${on ? "true" : "false"}" aria-label="${fmt(dt)}">${d}</button>`;
    }
    h += "<i></i>".repeat(42 - first - days); // always six weeks, so the layout never jumps between months
    c.grid.innerHTML = h;
  }
  if (o.cal) {
    const c = o.cal;
    c.grid.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-d]"); if (!b) return;
      const d = new Date(view.getFullYear(), view.getMonth(), Number(b.dataset.d));
      picked = picked && +picked === +d ? null : d;
      if (picked && o.nodate) o.nodate.checked = false;
      cal(); say();
    });
    c.prev.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); cal(); });
    c.next.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); cal(); });
  }
  o.nodate?.addEventListener("change", () => { if (o.nodate!.checked) { picked = null; cal(); } say(); });

  function parts() {
    const f = new FormData(form);
    const native = String(f.get("date") ?? "");
    const date = picked ?? (native ? new Date(native + "T12:00:00") : null);
    return {
      kind: String(f.get("kind") ?? ""), need: f.getAll("need").map(String), date,
      name: String(f.get("name") ?? "").trim(), email: String(f.get("email") ?? "").trim(), note: String(f.get("note") ?? "").trim(),
    };
  }
  const what = (kind: string, html = false) => {
    if (!kind) return "an event";
    if (kind === "something else") return html ? "<b>something</b>" : "something";
    return `${/^[aeiou]/.test(kind) ? "an" : "a"} ${html ? `<b>${esc(kind)}</b>` : kind}`;
  };
  function say() {
    const p = parts();
    if (o.say) o.say.innerHTML = `“Hi Oscar — we've got ${what(p.kind, true)}${p.date ? ` on <b>${fmt(p.date)}</b>` : o.nodate?.checked ? " (no date yet)" : ""}${p.need.length ? ` and we'd love <b>${esc(list(p.need))}</b>` : ""}.”`;
    if (o.picked) o.picked.textContent = p.date ? fmt(p.date) : "optional";
  }
  form.addEventListener("input", say);
  form.addEventListener("change", say);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const p = parts(), em = form.elements.namedItem("email") as HTMLInputElement;
    if (!/^\S+@\S+\.\S+$/.test(p.email)) { em.focus(); if (o.sent) o.sent.textContent = "Pop your email in so I can reply."; return; }
    const lines = [
      "Hi Oscar,", "",
      `We've got ${what(p.kind)}${p.date ? ` on ${fmt(p.date)}` : " (no date yet)"}${p.need.length ? ` and we'd love ${list(p.need)}` : ""}.`,
      p.note ? `\n${p.note}` : "", "", p.name || "—", p.email,
    ];
    const url = `mailto:${o.email}?subject=${encodeURIComponent(`Shoot enquiry${p.kind ? ` — ${p.kind}` : ""}${p.date ? `, ${fmt(p.date)}` : ""}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
    if (o.sent) o.sent.innerHTML = `Opening your email app… nothing happened? Write to <a href="${url}">${o.email}</a>`;
    location.href = url;
  });
  cal(); say();
}

/** scale a single-line element's font-size so it exactly fills its parent's content width */
export function fitText(el: HTMLElement, max = 1) {
  const run = () => {
    const p = el.parentElement!; const cs = getComputedStyle(p);
    const avail = (p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * max;
    el.style.fontSize = "100px"; const w = el.scrollWidth; if (!w) return;
    el.style.fontSize = Math.floor((100 * avail) / w * 0.995) + "px";
  };
  run(); addEventListener("resize", run); (document as any).fonts?.ready.then(run); addEventListener("load", run);
}
