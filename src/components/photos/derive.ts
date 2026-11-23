// Derived, read-only views over the photo data (Sanity, or placeholders until photos are published).
import { events, loadPortfolio } from "@/data/photos";

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) =>
  !iso ? "" : new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });

export const totals = {
  photos: events.reduce((n, e) => n + e.stats.photos, 0),
  events: events.length,
  attendees: events.reduce((n, e) => n + (e.stats.attendees ?? 0), 0),
  fastest: "24h",
  clients: events.length,
};

export const clients = events.map((e) => e.client);
export const quotes = events.filter((e) => e.quote).map((e) => ({ ...e.quote!, event: e.name, client: e.client, accent: e.accent }));
export const eventTypes = ["conference", "hackathon", "demo night", "launch", "panel", "meetup", "offsite"];
export const wants = ["photos", "recap reel", "portraits", "24h selects"];
export const budgets = ["under £500", "£500–1k", "£1–2k", "£2k+", "not sure yet"];
export const crowds = ["<50", "50–150", "150–400", "400+"];

export async function loadSelects() {
  const { heroPhoto, hasPortfolio, allShots } = await loadPortfolio();
  // Use Sanity order to choose the opening portraits and landscape.
  const portraits = allShots.filter((shot) => shot.height > shot.width).slice(0, 2);
  const landscape = allShots.find((shot) => shot.width > shot.height);
  const openingRow = hasPortfolio && portraits.length === 2 && landscape ? [...portraits, landscape] : [];
  const orderedShots = [...openingRow, ...allShots.filter((shot) => !openingRow.includes(shot))];
  const shotIndex = new Map(orderedShots.map((s, i) => [s.id, i]));

  /** compact payload for the lightbox */
  const viewerData = orderedShots.map((s) => ({
    src: s.src,
    thumb: s.thumb,
    w: s.width,
    h: s.height,
    cap: s.caption,
    ev: s.event.name,
    client: s.event.client,
    date: fmtDate(s.event.date),
    place: s.event.place,
    exif: s.exif ? `${s.exif.camera} · ${s.exif.lens} · ${s.exif.aperture} · ${s.exif.shutter}s · ISO ${s.exif.iso}` : "",
  }));

  /** a hand-picked "best of" order: interleave events so the grid never shows one event in a clump */
  const mixed = hasPortfolio ? orderedShots : (() => {
    const out: typeof allShots = [];
    const max = Math.max(...events.map((e) => e.shots.length));
    for (let i = 0; i < max; i++) for (const e of events) if (e.shots[i]) out.push({ ...e.shots[i], event: e });
    return out;
  })();
  return { heroPhoto, hasPortfolio, mixed, viewerData, shotIndex, openingRow };
}
