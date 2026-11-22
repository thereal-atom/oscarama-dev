// Derived, read-only views over the photo data (Sanity, or placeholders until photos are published).
import { events, allShots, services, contact, hasRealPhotos, realShots, shotLabel } from "@/data/photos";

export { events, allShots, services, contact, hasRealPhotos, shotLabel };

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

/** index of a shot inside allShots (the viewer addresses shots by this index) */
export const shotIndex = new Map(allShots.map((s, i) => [s.id, i]));

/** compact payload for the lightbox */
export const viewerData = allShots.map((s) => ({
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
export const mixed = hasRealPhotos ? realShots : (() => {
  const out: typeof allShots = [];
  const max = Math.max(...events.map((e) => e.shots.length));
  for (let i = 0; i < max; i++) for (const e of events) if (e.shots[i]) out.push({ ...e.shots[i], event: e });
  return out;
})();
