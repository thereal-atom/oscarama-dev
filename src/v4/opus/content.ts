// OSCARAMA (v4 / opus): every fact on the site lives here.
// Copy is Oscar's own (from the v1 homepage + events data), reworded into film language.

import coloopLogo from "@/assets/logos/coloop-new.png";
import outpostLogo from "@/assets/logos/outpost.png";
import ycLogo from "@/assets/logos/yc.png";
import fanksLogo from "@/assets/logos/fanks.png";
import expLogo from "@/assets/logos/exp.png";
import helioLogo from "@/assets/logos/helio.png";
import capturedAboveLogo from "@/assets/logos/capturedabove.png";
import omisphereLogo from "@/assets/logos/omisphere.png";
import archieLogo from "@/assets/logos/archie.png";
import basedHackLogo from "@/assets/logos/basedhack.png";
import basedLogo from "@/assets/logos/based.png";
import umLogo from "@/assets/logos/um.png";
import vercelLogo from "@/assets/logos/vercel.png";
import openaiLogo from "@/assets/logos/openai.png";
import corgiLogo from "@/assets/logos/corgi.png";
import daytonaLogo from "@/assets/logos/daytona.svg";
import spacexaiLogo from "@/assets/logos/spacexai.svg";
import coderabbitLogo from "@/assets/logos/coderabbit.png";
import brightdataLogo from "@/assets/logos/brightdata.png";
import mubitLogo from "@/assets/logos/mubit.png";

import typescriptIcon from "@/assets/techs/typescript.svg";
import bunIcon from "@/assets/techs/bun.svg";
import nextjsIcon from "@/assets/techs/nextjs.svg";
import svelteIcon from "@/assets/techs/svelte.svg";
import rustIcon from "@/assets/techs/rust.svg";
import tailwindIcon from "@/assets/techs/tailwindcss.svg";
import pythonIcon from "@/assets/techs/python.svg";
import awsIcon from "@/assets/techs/aws.svg";

export const logos = {
  coloop: coloopLogo,
  outpost: outpostLogo,
  yc: ycLogo,
  vercel: vercelLogo,
  capturedAbove: capturedAboveLogo,
};

export const links = {
  luma: "https://luma.com/londonmaxxing-ai",
  lumaOscar: "https://luma.com/oscarama",
  outpost: "https://outpostcrew.co",
  github: "https://github.com/thereal-atom",
  linkedin: "https://linkedin.com/in/oscarfalemara",
  x: "https://x.com/oscarfalll",
  coloop: "https://coloop.ai",
  coloopYc: "https://www.ycombinator.com/companies/coloop",
  kcl: "https://techsummit.kcltech.co.uk/",
  z2aRecap: "/events/zero-to-agent",
  z2aVideo: "https://www.youtube.com/watch?v=i7uWbXDCj0A",
  z2aVercel: "https://community.vercel.com/hackathons/zero-to-agent",
  capturedAbove: "https://capturedabove-website.vercel.app",
  helioSale: "https://www.moonpay.com/en-gb/newsroom/helio-acquisition",
};

export const socials = [
  { label: "github", href: links.github },
  { label: "x", href: links.x },
  { label: "linkedin", href: links.linkedin },
];

/** The scenes of the homepage, in running order. */
export const scenes = [
  { id: "cold-open", no: "01", title: "cold open", gist: "who he is, in one frame" },
  { id: "trailer", no: "02", title: "the trailer", gist: "the whole story in 12 cuts" },
  { id: "screenplay", no: "03", title: "the screenplay", gist: "self-taught, 14, coloop ai" },
  { id: "ensemble", no: "04", title: "the ensemble", gist: "outpost, 5k+ builders" },
  { id: "call-sheet", no: "05", title: "the call sheet", gist: "zero to agent, kcl, 30+ events" },
  { id: "festival", no: "06", title: "festival circuit", gist: "hackathons" },
  { id: "rack-focus", no: "07", title: "behind the camera", gist: "drones at 16, a camera at 19" },
  { id: "contact-sheet", no: "08", title: "the contact sheet", gist: "past work + side projects" },
  { id: "credits", no: "09", title: "end credits", gist: "stack, off-duty, say hi" },
  { id: "post-credits", no: "10", title: "post-credits", gist: "the sequel" },
] as const;

/** SC.02 — the trailer. Hard cuts, one fact per card. */
export type TrailerCard =
  | { kind: "rating" }
  | { kind: "line"; lead?: string; big: string; foot?: string; size?: "xl" | "l" | "m" }
  | { kind: "title" };

export const trailer: TrailerCard[] = [
  { kind: "rating" },
  {
    kind: "line",
    lead: "in a city full of builders",
    big: "one kid",
    foot: "taught himself to code",
    size: "xl",
  },
  { kind: "line", lead: "he was", big: "fourteen.", size: "xl" },
  {
    kind: "line",
    lead: "less than five months later",
    big: "his first client.",
    foot: "still fourteen",
    size: "l",
  },
  {
    kind: "line",
    lead: "at eighteen, before finishing high school",
    big: "a yc startup.",
    foot: "full-time software engineer · coloop ai (yc s21)",
    size: "l",
  },
  {
    kind: "line",
    lead: "no degree.",
    big: "no uni.",
    foot: "a full-time engineer who's never been to uni",
    size: "xl",
  },
  {
    kind: "line",
    lead: "then he started inviting people",
    big: "30+ events. 2,000+ people.",
    foot: "with openai · vercel · spacexai · daytona · corgi · and more",
    size: "m",
  },
  {
    kind: "line",
    lead: "one hackathon. one organiser.",
    big: "100 builders.",
    foot: "£5.8k cash · $1m+ in credits · vercel's zero to agent, london",
    size: "l",
  },
  {
    kind: "line",
    lead: "a community for those building at the frontier",
    big: "5,000+",
    foot: "outpost",
    size: "xl",
  },
  { kind: "line", lead: "and next?", big: "an aerospace company.", foot: "soon", size: "m" },
  { kind: "title" },
];

/** SC.04 — the ensemble: what outpost does, framed as a split-screen montage. */
export const montage = [
  { key: "hackathons", shot: "wide", note: "a room full of laptops" },
  { key: "meetups", shot: "tracking", note: "introductions, everywhere" },
  { key: "dinners", shot: "overhead", note: "the long table" },
  { key: "coworking", shot: "static", note: "heads down, lamps on" },
  { key: "outpost", shot: "", note: "" },
  { key: "run clubs", shot: "dolly", note: "keeping pace" },
  { key: "cafes", shot: "insert", note: "coffee, steam" },
  { key: "demo nights", shot: "over the shoulder", note: "someone ships live" },
  { key: "bouldering", shot: "low angle", note: "the wall" },
] as const;

/** SC.05 — production history: companies he's made events with. */
export const studios = [
  { name: "OpenAI", href: "https://luma.com/codex-ldn-1", logo: openaiLogo },
  { name: "Vercel", href: "/events/zero-to-agent", logo: vercelLogo },
  { name: "SpaceXAI", href: "https://x.ai", logo: spacexaiLogo },
  { name: "Daytona", href: "https://www.daytona.io", logo: daytonaLogo },
  { name: "Corgi", href: "https://corgi.insure", logo: corgiLogo },
];

export const sponsors = [
  { name: "CodeRabbit", href: "https://coderabbit.ai", logo: coderabbitLogo },
  { name: "Bright Data", href: "https://brightdata.com", logo: brightdataLogo },
  { name: "Mubit", href: "https://mubit.ai", logo: mubitLogo },
];

/** SC.06 — the festival circuit: hackathons as film festivals. */
export const festivals = [
  {
    honour: "winner",
    festival: "first ever hackathon",
    place: "",
    film: "OmiSphere",
    logos: [omisphereLogo],
    logline:
      "a project that aims to turn every conversation into part of a collective consciousness.",
    links: [{ label: "omisphere on github", href: "https://github.com/omisphere/omisphere" }],
  },
  {
    honour: "official selection",
    festival: "based hack",
    place: "lithuania",
    film: "archie.",
    logos: [basedHackLogo, archieLogo],
    logline:
      "flown out to lithuania, where we built archie. and were one of the teams chosen to pitch to 100+ people in the room.",
    links: [
      { label: "basedhack.com", href: "https://www.basedhack.com/" },
      { label: "archie.to", href: "https://archie.to" },
    ],
  },
  {
    honour: "out of competition",
    festival: "sunstead hack",
    place: "finland",
    film: "(tobogganing)",
    logos: [basedLogo, umLogo],
    logline:
      "flown out to finland by based collective and unicorn mafia. we didn't win, but we vibe coded while tobogganing.",
    links: [
      { label: "sunsteadhack.com", href: "https://sunsteadhack.com/" },
      { label: "based collective", href: "https://www.basedcollective.ai/" },
      { label: "unicorn mafia", href: "https://www.unicornmafia.ai/" },
    ],
  },
];

/** SC.08 — the contact sheet. Frames on two rolls. */
export type Frame = {
  no: string;
  title: string;
  logline: string;
  href: string;
  logo?: ImageMetadata;
  select?: string; // grease-pencil note for circled frames
  extra?: { label: string; href: string };
};

const gh = (q: string) => `${links.github}?tab=repositories&q=${encodeURIComponent(q)}`;

export const rolls: { name: string; label: string; frames: Frame[] }[] = [
  {
    name: "roll a",
    label: "past productions",
    frames: [
      {
        no: "1",
        title: "helio",
        logline: "spent a few months freelancing at a crypto payments startup.",
        href: "https://hel.io",
        logo: helioLogo,
        select: "later sold for $175m",
        extra: {
          label: "the moonpay acquisition",
          href: "https://www.moonpay.com/en-gb/newsroom/helio-acquisition",
        },
      },
      {
        no: "2",
        title: "EXP",
        logline:
          "built the bot systems from the ground up, with bank systems handling $100,000s of in-game value. helped it grow from 2k to 45k+ members.",
        href: "https://discord.gg/exp",
        logo: expLogo,
        select: "2k → 45k+",
      },
      {
        no: "3",
        title: "fanks",
        logline: "helping build better community-brand matching.",
        href: "https://fanks.co",
        logo: fanksLogo,
      },
      {
        no: "4",
        title: "captured above",
        logline: "the drone videography business, started at 16 with a friend.",
        href: links.capturedAbove,
        logo: capturedAboveLogo,
      },
    ],
  },
  {
    name: "roll b",
    label: "shorts · side projects",
    frames: [
      {
        no: "5",
        title: "openai.js",
        logline: "a small node.js wrapper for the openai api. written at 15.",
        href: gh("openai.js"),
        select: "age 15",
      },
      {
        no: "6",
        title: "docdepot",
        logline: "upload and distribute markdown files.",
        href: gh("docdepot"),
      },
      {
        no: "7",
        title: "notes ai",
        logline: "talk to your obsidian notes through an llm.",
        href: gh("notes"),
      },
      {
        no: "8",
        title: "alertbots",
        logline: "no logline on file. the repo speaks for itself.",
        href: gh("alertbots"),
      },
      {
        no: "9",
        title: "papr",
        logline: "no logline on file. the repo speaks for itself.",
        href: gh("papr"),
      },
      { no: "10", title: "arb bot", logline: "a solana arbitrage bot.", href: gh("arb") },
      {
        no: "11",
        title: "project liquid",
        logline: "delta-neutral yield farming on solana.",
        href: gh("liquid"),
      },
      {
        no: "12",
        title: "saasalytics",
        logline: "an ai-driven dashboard for business data.",
        href: gh("saasalytics"),
      },
    ],
  },
];

export const stack = [
  { name: "typescript", icon: typescriptIcon },
  { name: "bun", icon: bunIcon },
  { name: "svelte", icon: svelteIcon },
  { name: "next.js", icon: nextjsIcon },
  { name: "rust", icon: rustIcon },
  { name: "python", icon: pythonIcon },
  { name: "tailwind", icon: tailwindIcon },
  { name: "aws", icon: awsIcon },
];
