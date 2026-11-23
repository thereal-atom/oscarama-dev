// Photo page data. Real photos come from Sanity (studio/) at build time;
// the placeholder events below are only used while Sanity has no published photos.
import { sanityImage, sanityQuery } from "@/lib/sanity";

export interface Shot {
  id: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
  caption: string;
  exif?: { camera: string; lens: string; aperture: string; shutter: string; iso: number };
}

export interface EventShoot {
  slug: string;
  name: string; // event name
  client: string; // who hired / hosted
  date: string; // ISO
  place: string;
  type: "conference" | "hackathon" | "demo night" | "launch" | "panel" | "meetup" | "offsite";
  deliverables: string[]; // e.g. "photos", "recap video", "headshots"
  stats: { photos: number; turnaround: string; attendees?: number };
  accent: string;
  quote?: { text: string; by: string };
  shots: Shot[];
}

const accents = ["#0000F2", "#FF3B1F", "#F20079", "#79F200", "#F27900", "#1E4BFF", "#EB5068", "#FFD400"];
const cams = [
  { camera: "Sony A7 IV", lens: "35mm f/1.4 GM" },
  { camera: "Sony A7 IV", lens: "85mm f/1.8" },
  { camera: "Fujifilm X100VI", lens: "23mm f/2" },
  { camera: "Sony FX3", lens: "24-70mm f/2.8 GM II" },
];

const raw: Array<Omit<EventShoot, "shots" | "accent"> & { n: number; captions: string[] }> = [
  { slug: "kcl-tech-summit", name: "KCL Tech Summit", client: "KCL Tech", date: "2026-11-08", place: "King's College London", type: "conference", deliverables: ["photos", "recap reel"], stats: { photos: 412, turnaround: "48h", attendees: 600 }, quote: { text: "the recap reel did more numbers than the event itself", by: "organiser, KCL Tech" }, n: 6, captions: ["keynote, main stage", "the queue at 8:58am", "panel q&a", "speaker green room", "lanyards everywhere", "after-party"] },
  { slug: "demo-night-7", name: "Demo Night #7", client: "Demo Nights", date: "2026-10-02", place: "Shoreditch, London", type: "demo night", deliverables: ["photos", "speaker portraits"], stats: { photos: 238, turnaround: "24h", attendees: 180 }, n: 5, captions: ["live demo, wifi held", "founder mid-pitch", "crowd reaction", "pizza logistics", "winner announced"] },
  { slug: "zero-to-agent", name: "Zero to Agent", client: "Coloop", date: "2026-09-12", place: "Coloop HQ, London", type: "hackathon", deliverables: ["photos", "recap video"], stats: { photos: 520, turnaround: "72h", attendees: 120 }, quote: { text: "felt like he was part of the team, not a guy with a camera", by: "head of events" }, n: 6, captions: ["hour 1: optimism", "hour 14: whiteboards", "hour 22: someone asleep", "judging", "the winning team", "group photo, finally"] },
  { slug: "outventuring", name: "Outventuring", client: "Outpost", date: "2026-08-23", place: "River Wye", type: "offsite", deliverables: ["photos", "short film"], stats: { photos: 310, turnaround: "1 week", attendees: 40 }, n: 4, captions: ["kayaks at dawn", "founders in wetsuits", "campfire pitch", "the drive home"] },
  { slug: "corgi-launch", name: "Corgi Launch Party", client: "Corgi", date: "2026-07-17", place: "Clerkenwell, London", type: "launch", deliverables: ["photos", "social cutdowns"], stats: { photos: 190, turnaround: "24h", attendees: 250 }, quote: { text: "we posted the first set before people got home", by: "co-founder, Corgi" }, n: 5, captions: ["doors open", "the founders' toast", "product on screen", "dancefloor", "3am"] },
  { slug: "pauline-panel", name: "Pauline x Founders Panel", client: "Pauline", date: "2026-06-05", place: "Somerset House, London", type: "panel", deliverables: ["photos", "headshots", "clips"], stats: { photos: 160, turnaround: "48h", attendees: 90 }, n: 4, captions: ["panel in session", "audience question", "headshot set", "backstage laugh"] },
  { slug: "ai-tinkerers", name: "AI Tinkerers London", client: "AI Tinkerers", date: "2026-05-14", place: "Kings Cross, London", type: "meetup", deliverables: ["photos"], stats: { photos: 140, turnaround: "24h", attendees: 200 }, n: 4, captions: ["lightning talk", "laptops open", "hallway track", "the organiser, finally sitting down"] },
];

let k = 0;
export const events: EventShoot[] = raw.map(({ n, captions, ...e }, ei) => ({
  ...e,
  accent: accents[ei % accents.length],
  shots: Array.from({ length: n }, (_, i) => {
    k++;
    const portrait = (k * 7) % 5 === 0;
    const w = 1600, h = portrait ? 2000 : 1067;
    const seed = `ev-${e.slug}-${i}`;
    const cam = cams[k % cams.length];
    return {
      id: `${e.slug}-${i + 1}`,
      src: `https://picsum.photos/seed/${seed}/${w}/${h}`,
      thumb: `https://picsum.photos/seed/${seed}/${Math.round(w / 3)}/${Math.round(h / 3)}`,
      width: w,
      height: h,
      caption: captions[i] ?? e.name,
      exif: { ...cam, aperture: ["f/1.4", "f/2", "f/2.8", "f/1.8"][k % 4], shutter: ["1/250", "1/125", "1/500", "1/60"][k % 4], iso: [800, 1600, 3200, 6400][k % 4] },
    };
  }),
}));

const placeholderShots = events.flatMap((e) => e.shots.map((s) => ({ ...s, event: e })));

// ── real photos: the "portfolio" doc in Sanity, in the order they're arranged there ──
const noEvent: EventShoot = { slug: "", name: "", client: "", date: "", place: "", type: "meetup", deliverables: [], stats: { photos: 0, turnaround: "" }, accent: accents[0], shots: [] };
type SanityPortfolio = { hero?: { ref?: string; hotspot?: { x: number; y: number } }; photos?: Array<{ _key: string; caption?: string; ref?: string }> };
export async function loadPortfolio() {
  const portfolio = await sanityQuery<SanityPortfolio | null>(`*[_id == "portfolio"][0]{ "hero": hero{ "ref": asset._ref, hotspot }, "photos": photos[showInSelects == true]{ _key, caption, "ref": asset._ref } }`);

  /** the hand-picked photo beside the headline; `focus` is a CSS object-position from the Studio hotspot */
  const heroPhoto = (() => {
    const img = portfolio?.hero?.ref ? sanityImage(portfolio.hero.ref) : null;
    if (!img) return null;
    const h = portfolio!.hero!.hotspot;
    return { src: img.url(1600), width: img.width, height: img.height, focus: h ? `${(h.x * 100).toFixed(1)}% ${(h.y * 100).toFixed(1)}%` : "50% 50%" };
  })();

  const realShots = (portfolio?.photos ?? []).flatMap((p) => {
    const img = p.ref ? sanityImage(p.ref) : null;
    if (!img) return [];
    const shot: Shot = { id: p._key, src: img.url(2400), thumb: img.url(800), width: img.width, height: img.height, caption: p.caption?.trim() ?? "" };
    return [{ ...shot, event: noEvent }];
  });
  const hasPortfolio = portfolio != null;
  return { heroPhoto, hasPortfolio, allShots: hasPortfolio ? realShots : placeholderShots };
}

/** "caption · event", skipping whichever is empty */
export const shotLabel = (s: { caption: string; event: { name: string } }) => [s.caption, s.event.name].filter(Boolean).join(" · ");

export const services = [
  { name: "event photography", detail: "conferences, hackathons, demo nights, launches. candid > posed." },
  { name: "recap video", detail: "60–90s reels cut for socials, plus a longer cut if you want it." },
  { name: "speaker & founder portraits", detail: "on-site mini studio or available light." },
  { name: "fast turnaround", detail: "first selects within 24h so you can post while it's still hot." },
];

export const contact = { email: "hello@oscarama.dev", instagram: "oscarfalll", x: "oscarfalll", basedIn: "London" };

// Real clients to show as logos (user will add more). Use these instead of KPIs/stats.
import spacexai from "@/assets/logos/spacexai.svg";
import openai from "@/assets/logos/openai.png";
import vercel from "@/assets/logos/vercel.png";
import corgi from "@/assets/logos/corgi.png";
import cognition from "@/assets/logos/cognition.svg";

export const clients = [
  { name: "SPACEXAI", logo: spacexai },
  { name: "OpenAI", logo: openai },
  { name: "Vercel", logo: vercel },
  { name: "Corgi", logo: corgi },
  { name: "Cognition", logo: cognition },
];
