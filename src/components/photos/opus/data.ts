// Server-side derivations from the shared photo data (build time only).
import { events, allShots, services, contact } from "@/data/photos";

export { events, allShots, services, contact };

export const clientShots = allShots.map((s) => ({
  id: s.id,
  src: s.src,
  thumb: s.thumb,
  w: s.width,
  h: s.height,
  caption: s.caption,
  exif: s.exif,
  event: s.event.name,
  slug: s.event.slug,
  client: s.event.client,
  type: s.event.type,
  date: s.event.date,
  place: s.event.place,
}));

export const totals = {
  photos: events.reduce((a, e) => a + e.stats.photos, 0),
  people: events.reduce((a, e) => a + (e.stats.attendees ?? 0), 0),
  events: events.length,
  fastest: "24h",
  clients: [...new Set(events.map((e) => e.client))],
  types: [...new Set(events.map((e) => e.type))],
};

export const quotes = events.filter((e) => e.quote).map((e) => ({ ...e.quote!, event: e.name, client: e.client }));

/** A curated "favourites" interleave: one shot from each event in turn. */
export function interleave() {
  const out: typeof clientShots = [];
  const max = Math.max(...events.map((e) => e.shots.length));
  for (let i = 0; i < max; i++)
    for (const e of events) {
      const s = clientShots.find((c) => c.id === `${e.slug}-${i + 1}`);
      if (s) out.push(s);
    }
  return out;
}

export const fmt = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }).toLowerCase();
