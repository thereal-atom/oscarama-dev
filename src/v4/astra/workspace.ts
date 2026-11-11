document.documentElement.classList.add("has-js");
const commandDialog = document.querySelector<HTMLDialogElement>("#command-dialog")!;
const briefDialog = document.querySelector<HTMLDialogElement>("#brief-dialog")!;
const input = document.querySelector<HTMLInputElement>("#command-input")!;
const results = [...document.querySelectorAll<HTMLAnchorElement>("[data-search]")];
function showCommand() {
  if (briefDialog.open) briefDialog.close();
  commandDialog.showModal();
  input.value = "";
  filterCommands();
  input.focus();
}
function filterCommands() {
  const query = input.value.toLowerCase().trim();
  results.forEach((link) => {
    link.hidden = !`${link.dataset.search} ${link.innerText}`.toLowerCase().includes(query);
  });
  document.querySelector<HTMLElement>("#no-results")!.hidden = results.some((link) => !link.hidden);
}
document
  .querySelectorAll("[data-command]")
  .forEach((button) => button.addEventListener("click", showCommand));
document
  .querySelectorAll("[data-brief]")
  .forEach((button) => button.addEventListener("click", () => briefDialog.showModal()));
input.addEventListener("input", filterCommands);
[commandDialog, briefDialog].forEach((dialog) => {
  dialog.querySelector("[data-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
});
results.forEach((link) => link.addEventListener("click", () => commandDialog.close()));
document.addEventListener("keydown", (event) => {
  const editing =
    event.target instanceof HTMLElement &&
    (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) ||
      event.target.isContentEditable);
  if (
    ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") ||
    (!editing && !event.metaKey && !event.ctrlKey && ["/", "?"].includes(event.key))
  ) {
    event.preventDefault();
    commandDialog.open ? commandDialog.close() : showCommand();
  }
  if (commandDialog.open) {
    const visible = results.filter((link) => !link.hidden);
    const index = visible.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      visible[
        index === -1
          ? direction === 1
            ? 0
            : visible.length - 1
          : (index + direction + visible.length) % visible.length
      ]?.focus();
    }
    if (event.key === "Enter" && document.activeElement === input) {
      event.preventDefault();
      visible[0]?.click();
    }
  }
});
const profile =
  "oscar falemara — self-taught software & AI engineer in london. building at coloop ai (yc s21), running outpost. started coding at 14, joined coloop at 18. 30+ events hosted or helped organise, 2,000+ attendees. github.com/thereal-atom | linkedin.com/in/oscarfalemara";
document.querySelector("[data-copy]")?.addEventListener("click", async () => {
  const feedback = document.querySelector<HTMLElement>(".copy-feedback")!;
  feedback.textContent = "copying…";
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      navigator.clipboard.writeText(profile),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Clipboard timed out")), 2000);
      }),
    ]);
    feedback.textContent = "copied. a whole person, somewhat compressed.";
  } catch {
    feedback.textContent = "clipboard unavailable — you can select and copy the text above.";
  } finally {
    clearTimeout(timeout);
  }
});
const sourceButton = document.querySelector<HTMLButtonElement>("[data-source-toggle]");
sourceButton?.addEventListener("click", () => {
  const pressed = sourceButton.getAttribute("aria-pressed") !== "true";
  sourceButton.setAttribute("aria-pressed", String(pressed));
  document.querySelector<HTMLElement>(".inspector-preview")!.hidden = pressed;
  document.querySelector<HTMLElement>(".inspector-source")!.hidden = !pressed;
  sourceButton.textContent = pressed ? "view human" : "view source";
});
function updateClock() {
  document.querySelectorAll("[data-clock]").forEach((clock) => {
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  });
}
updateClock();
setInterval(updateClock, 60_000);
const filters = document.querySelectorAll<HTMLButtonElement>("[data-filter]");
filters.forEach((button) =>
  button.addEventListener("click", () => {
    filters.forEach((filter) => filter.setAttribute("aria-pressed", String(filter === button)));
    let count = 0;
    document.querySelectorAll<HTMLElement>("[data-kind]").forEach((row) => {
      row.hidden = button.dataset.filter !== "all" && row.dataset.kind !== button.dataset.filter;
      if (!row.hidden) count++;
    });
    const counter = document.querySelector("[data-result-count]");
    if (counter) counter.textContent = `${count} entries`;
  })
);

// The document's location is reflected in the workspace navigation.
const sections = [
  { node: document.querySelector(".hero"), href: "/v4/astra" },
  { node: document.querySelector("#work"), href: "/v4/astra#work" },
  { node: document.querySelector("#changelog"), href: "/v4/astra#changelog" },
  { node: document.querySelector("#outside"), href: "/v4/astra#outside" },
];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const href = sections.find((section) => section.node === entry.target)?.href;
        document.querySelectorAll<HTMLAnchorElement>(".side-nav > a").forEach((link) => {
          const selected = link.getAttribute("href") === href;
          link.classList.toggle("selected", selected);
          if (selected) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    },
    { rootMargin: "-10% 0px -65% 0px" }
  );
  sections.forEach((section) => {
    if (section.node) observer.observe(section.node);
  });
}
