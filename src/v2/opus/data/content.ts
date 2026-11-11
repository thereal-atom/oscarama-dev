// All copy for /v2/opus lives here. Facts come from the v1 site, oscar's github
// profile readme and outpostcrew.co. Anything about mountains/rockets is kept
// general, aspirational or obviously a joke.

import coloop from "@/assets/logos/coloop-new.png";
import outpost from "@/assets/logos/outpost.png";
import omisphere from "@/assets/logos/omisphere.png";
import basedhack from "@/assets/logos/basedhack.png";
import archie from "@/assets/logos/archie.png";
import based from "@/assets/logos/based.png";
import um from "@/assets/logos/um.png";
import fanks from "@/assets/logos/fanks.png";
import exp from "@/assets/logos/exp.png";
import helio from "@/assets/logos/helio.png";
import yc from "@/assets/logos/yc.png";
import vercel from "@/assets/logos/vercel.png";
import openai from "@/assets/logos/openai.png";
import corgi from "@/assets/logos/corgi.png";
import coderabbit from "@/assets/logos/coderabbit.png";
import brightdata from "@/assets/logos/brightdata.png";
import mubit from "@/assets/logos/mubit.png";
import capturedabove from "@/assets/logos/capturedabove.png";
import spacexai from "@/assets/logos/spacexai.svg";
import daytona from "@/assets/logos/daytona.svg";

export const logos = {
  coloop,
  outpost,
  omisphere,
  basedhack,
  archie,
  based,
  um,
  fanks,
  exp,
  helio,
  yc,
  vercel,
  openai,
  corgi,
  coderabbit,
  brightdata,
  mubit,
  capturedabove,
  spacexai,
  daytona,
};

export const links = {
  coloop: "https://coloop.ai",
  coloopYc: "https://www.ycombinator.com/companies/coloop",
  outpost: "https://outpostcrew.co",
  outpostLuma: "https://luma.com/londonmaxxing-ai",
  myLuma: "https://luma.com/oscarama",
  github: "https://github.com/thereal-atom",
  x: "https://x.com/oscarfalll",
  linkedin: "https://linkedin.com/in/oscarfalemara",
  kcl: "https://techsummit.kcltech.co.uk/",
  zeroToAgent: "/events/zero-to-agent",
  helioSale: "https://www.moonpay.com/en-gb/newsroom/helio-acquisition",
};

/** §02 the origin story, by age */
export const flightLog = [
  {
    age: "14",
    title: "first line of code",
    body: "taught myself to code. landed my first freelance client less than 5 months later, while still 14.",
  },
  {
    age: "15",
    title: "openai.js",
    body: "wrote a tiny javascript wrapper for the openai api back when it first came out.",
    href: "https://github.com/thereal-atom/openai.js",
  },
  {
    age: "16",
    title: "captured above",
    body: "started a drone videography business with a friend. mostly as an economic excuse to buy a drone.",
    href: "https://capturedabove-website.vercel.app",
    note: "uk drone ceiling: 120 m",
  },
  {
    age: "18",
    title: "coloop ai (yc s21)",
    body: "joined a yc startup as a full-time software engineer before i'd finished high school. never went to uni. a side project (notes ai) is what got me hired.",
    href: "https://coloop.ai",
  },
  {
    age: "19",
    title: "bought a camera",
    body: "photography & videography got serious. first paying clients within 2 months.",
  },
  {
    age: "now",
    title: "engineer + organiser",
    body: "shipping at coloop by day, running rooms full of builders by night. and weekends. and some lunchtimes.",
  },
];

/** §04 hackathons as boarding passes */
export const hacks = [
  {
    flight: "OMI-01",
    from: "LON",
    fromName: "london",
    to: "LON",
    toName: "home turf",
    event: "lfh × bolt.new hackathon",
    project: "omisphere",
    projectHref: "https://github.com/omisphere/omisphere",
    logo: "omisphere",
    status: "won",
    seat: "front row",
    body: `won my first ever hackathon with <a href="https://github.com/omisphere/omisphere" target="_blank" rel="noopener noreferrer" class="lnk">omisphere</a>: an attempt to turn every conversation into part of a collective consciousness.`,
  },
  {
    flight: "BSD-LT",
    from: "LON",
    fromName: "london",
    to: "LTU",
    toName: "lithuania",
    event: "based hack",
    eventHref: "https://www.basedhack.com/",
    project: "archie",
    projectHref: "https://archie.to",
    logo: "archie",
    status: "pitched",
    seat: "wherever the wifi is",
    body: `got flown out to lithuania 🇱🇹 for <a href="https://www.basedhack.com/" target="_blank" rel="noopener noreferrer" class="lnk">based hack</a>, built <a href="https://archie.to" target="_blank" rel="noopener noreferrer" class="lnk">archie</a>, and were one of the teams picked to pitch to 100+ people in the room.`,
  },
  {
    flight: "SUN-FI",
    from: "LON",
    fromName: "london",
    to: "FIN",
    toName: "finland",
    event: "sunstead hack",
    eventHref: "https://sunsteadhack.com/",
    project: "a toboggan",
    status: "tobogganed",
    seat: "on a sled",
    body: `flown out to finland 🇫🇮 by <a href="https://www.basedcollective.ai/" target="_blank" rel="noopener noreferrer" class="lnk">based collective</a> and <a href="https://www.unicornmafia.ai/" target="_blank" rel="noopener noreferrer" class="lnk">unicorn mafia</a>. we didn't win, but we vibe coded while tobogganing.`,
  },
] as const;

/** §06 previous missions */
export const missions = [
  {
    name: "fanks",
    href: "https://fanks.co",
    logo: "fanks",
    ring: "community × brands",
    what: "helped build better community-brand matching.",
  },
  {
    name: "exp",
    href: "https://discord.gg/exp",
    logo: "exp",
    ring: "2k → 45k+ members",
    what: "built the bot systems from the ground up, including bank systems handling $100,000s of in-game value. helped it grow from 2k to 45k+ members.",
  },
  {
    name: "helio",
    href: "https://hel.io",
    logo: "helio",
    ring: "crypto payments",
    what: "spent a few months freelancing at a crypto payments startup, which later sold to moonpay for $175m.",
    extraHref: "https://www.moonpay.com/en-gb/newsroom/helio-acquisition",
  },
] as const;

/** §06 test flights: side projects, all real repos */
export const testFlights = [
  {
    name: "notes ai",
    what: "chat with my obsidian notes via an llm. the project that got me hired.",
    href: "https://github.com/thereal-atom/obsidian-notes-ai",
    tag: "ts · genai",
  },
  {
    name: "openai.js",
    what: "tiny openai api wrapper. written at 15.",
    href: "https://github.com/thereal-atom/openai.js",
    tag: "js",
  },
  {
    name: "docdepot",
    what: "upload and share your markdown files.",
    href: "https://docdepot.vercel.app",
    tag: "svelte",
  },
  {
    name: "project liquid",
    what: "delta-neutral yield farming on solana.",
    href: "https://github.com/thereal-atom/project-liquid",
    tag: "svelte · defi",
  },
  {
    name: "arb bot",
    what: "a solana arbitrage bot.",
    href: "https://github.com/thereal-atom/arb-bot",
    tag: "ts · defi",
  },
  {
    name: "papr",
    what: "stock market paper trading for new traders.",
    href: "https://github.com/thereal-atom/papr",
    tag: "js",
  },
  {
    name: "saasalytics",
    what: "an ai-driven dashboard for your business data.",
    href: "https://saasalytics.vercel.app",
    tag: "next · ai",
  },
  {
    name: "alertbots",
    what: "cross-posts stock & crypto alerts to many discord servers at once.",
    href: "https://github.com/thereal-atom/alertbots",
    tag: "js",
  },
  {
    name: "spacex",
    what: "a site listing every spacex launch. the obsession started early.",
    href: "https://github.com/thereal-atom/spacex",
    tag: "react",
  },
  {
    name: "gravity-simulation",
    what: "a gravity simulation, in rust, for fun.",
    href: "https://github.com/thereal-atom/gravity-simulation",
    tag: "rust",
  },
];

/** §06 onboard systems */
export const stack = [
  ["languages", "typescript · rust · python"],
  ["runtime", "bun · node"],
  ["frontend", "svelte/kit · next.js · tailwind"],
  ["backend", "trpc · temporal · inngest · redis"],
  ["infra", "aws · cdk · vercel · railway"],
  ["ai", "multi-agent systems · agentic rag · ai sdk"],
] as const;

export const outpostFormats = [
  "hackathons",
  "meetups",
  "dinners",
  "coworking",
  "run clubs",
  "cafes",
  "demo nights",
  "bouldering",
  "and much more",
];

export const partners = [
  { name: "openai", logo: "openai", href: "https://luma.com/codex-ldn-1" },
  { name: "vercel", logo: "vercel", href: "/events/zero-to-agent" },
  { name: "spacexai", logo: "spacexai", href: "https://x.ai" },
  { name: "daytona", logo: "daytona", href: "https://www.daytona.io" },
  { name: "corgi", logo: "corgi", href: "https://corgi.insure" },
] as const;

export const offGrid = [
  "mountains",
  "hiking",
  "bouldering",
  "rock climbing",
  "running",
  "skiing",
  "camping",
];
