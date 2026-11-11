// The Concise Oscarama: every A–Z entry, grouped into "pages".
// Sense / usage strings are trusted HTML authored here (rendered with set:html).
// Conventions inside strings:
//   <mark class="hl">…</mark>      lime highlighter, swiped in on scroll
//   <a class="xr" href="#e-…">…</a> cross-reference to another entry
//   ~                               stands in for the headword (dictionary style)

export type Entry = {
  id: string;
  hw: string;
  pr?: string;
  pos: string;
  star?: boolean;
  senses: string[];
  ex?: string;
  see?: { id: string; label: string }[];
  link?: { href: string; label: string };
};

export type Letter = { letter: string; entries: Entry[] };
export type Page = { folio: string; letters: Letter[] };

const ext = (href: string, label: string) => ({ href, label });

export const pages: Page[] = [
  {
    folio: "1",
    letters: [
      {
        letter: "a",
        entries: [
          {
            id: "e-aerospace",
            hw: "aerospace",
            pr: "AIR·oh·spayss",
            pos: "n.",
            star: true,
            senses: [
              "the passion. the long game. oscar wants to <mark class='hl'>start an aerospace company</mark>, soon.",
            ],
            ex: "“one day, an ~ company.”",
            see: [
              { id: "e-rockets", label: "rockets" },
              { id: "e-space", label: "space" },
            ],
          },
          {
            id: "e-archie",
            hw: "archie",
            pr: "AR·chee",
            pos: "n.",
            senses: [
              "a thing built at <a class='xr' href='#e-based-hack'>based hack</a> in lithuania. the team was one of those picked to pitch to 100+ people in the room.",
            ],
            link: ext("https://archie.to", "archie.to"),
          },
        ],
      },
      {
        letter: "b",
        entries: [
          {
            id: "e-based-hack",
            hw: "based hack",
            pr: "BAYST hak",
            pos: "n.",
            senses: [
              "a hackathon in lithuania 🇱🇹 that <mark class='hl'>flew the team out</mark>. they built <a class='xr' href='#e-archie'>archie</a> and pitched it to a room of 100+.",
            ],
            link: ext("https://www.basedhack.com/", "basedhack.com"),
          },
          {
            id: "e-bouldering",
            hw: "bouldering",
            pr: "BOHL·der·ing",
            pos: "n.",
            senses: [
              "climbing short, hard walls with no rope, then sitting on a crash mat thinking about it.",
              "a favourite way to spend time off, and a recurring excuse for an event.",
            ],
            see: [{ id: "e-out-venturing", label: "out venturing" }],
          },
        ],
      },
      {
        letter: "c",
        entries: [
          {
            id: "e-camera",
            hw: "camera",
            pr: "KAM·ruh",
            pos: "n.",
            senses: ["bought at 19. first paying clients within two months."],
            see: [{ id: "e-photography", label: "photography" }],
          },
          {
            id: "e-captured-above",
            hw: "captured above",
            pr: "KAP·cherd uh·BUV",
            pos: "n.",
            senses: [
              "a drone videography business started at 16 with a friend, <mark class='hl'>“as an economic excuse to buy a drone.”</mark>",
            ],
            link: ext("https://capturedabove-website.vercel.app", "captured above"),
          },
          {
            id: "e-coloop",
            hw: "coloop ai",
            pr: "KOH·loop ay·EYE",
            pos: "n.",
            star: true,
            senses: [
              "a yc s21 startup in london where oscar is a <mark class='hl'>full-time software engineer</mark>, working across the stack: frontend, backend, ai and product.",
              "joined at 18, before he'd finished high school.",
              "also the home of his events, growth engineering, the coloop sports club and “lots of other fun stuff.”",
            ],
            see: [
              { id: "e-university", label: "university" },
              { id: "e-yc", label: "yc" },
            ],
            link: ext("https://coloop.ai", "coloop.ai"),
          },
          {
            id: "e-community",
            hw: "community",
            pr: "kuh·MYOO·nih·tee",
            pos: "n.",
            senses: ["what you end up with if you keep inviting people to things."],
            see: [{ id: "e-outpost", label: "outpost" }],
          },
        ],
      },
      {
        letter: "d",
        entries: [
          {
            id: "e-degree",
            hw: "degree",
            pr: "dih·GREE",
            pos: "n.",
            senses: [
              "<i>(university)</i> <mark class='hl'>none held</mark>. it has not come up.",
              "<i>(celsius, finland)</i> not many.",
            ],
            see: [
              { id: "e-university", label: "university" },
              { id: "e-toboggan", label: "toboggan" },
            ],
          },
          {
            id: "e-demo-nights",
            hw: "demo nights",
            pr: "DEM·oh nyts",
            pos: "n. pl.",
            senses: [
              "<i>ai demo nights</i>: evenings where a curated set of builders show off what they've been making in ai. oscar helps run them.",
            ],
            see: [{ id: "appendix-a", label: "appendix a" }],
          },
          {
            id: "e-docdepot",
            hw: "docdepot",
            pr: "DOK·dep·oh",
            pos: "n.",
            senses: ["a way to upload and share your markdown files. one of many side projects."],
            link: ext("https://docdepot.vercel.app", "docdepot"),
          },
          {
            id: "e-drone",
            hw: "drone",
            pr: "drohn",
            pos: "n.",
            senses: ["a flying camera, acquired under the cover of a business."],
            see: [{ id: "e-captured-above", label: "captured above" }],
          },
        ],
      },
    ],
  },
  {
    folio: "2",
    letters: [
      {
        letter: "e",
        entries: [
          {
            id: "e-events",
            hw: "events",
            pr: "ih·VENTS",
            pos: "n. pl.",
            star: true,
            senses: [
              "<mark class='hl'>30+ hosted or helped organise</mark>, with 2,000+ people through the door.",
              "made with openai, vercel, spacexai, daytona, corgi and more.",
            ],
            ex: "“come to an ~!”",
            see: [{ id: "appendix-a", label: "appendix a" }],
          },
          {
            id: "e-exp",
            hw: "exp",
            pr: "ee·ex·PEE",
            pos: "n.",
            senses: [
              "a discord community where oscar built the bot and bank systems from the ground up, handling <mark class='hl'>$100,000s of in-game value</mark>.",
              "grew from 2k to 45k+ members along the way.",
            ],
            link: ext("https://discord.gg/exp", "discord.gg/exp"),
          },
        ],
      },
      {
        letter: "f",
        entries: [
          {
            id: "e-fanks",
            hw: "fanks",
            pr: "fanks",
            pos: "n.",
            senses: ["community-brand matching. oscar helped build a better version of it."],
            link: ext("https://fanks.co", "fanks.co"),
          },
          {
            id: "e-finland",
            hw: "finland",
            pr: "FIN·lund",
            pos: "n.",
            senses: [
              "🇫🇮 where based collective and unicorn mafia flew the team for <a class='xr' href='#e-sunstead'>sunstead hack</a>.",
            ],
            see: [{ id: "e-toboggan", label: "toboggan" }],
          },
          {
            id: "e-freelance",
            hw: "freelance",
            pr: "FREE·lahns",
            pos: "adj.",
            senses: [
              "first client: <mark class='hl'>less than five months</mark> after his first line of code. age at the time: 14.",
            ],
          },
        ],
      },
      {
        letter: "g",
        entries: [
          {
            id: "e-github",
            hw: "github",
            pr: "GIT·hub",
            pos: "n.",
            senses: [
              "where the side projects live: docdepot, alertbots, openai.js, papr, notes ai, a solana arb bot, project liquid, saasalytics.",
            ],
            link: ext("https://github.com/thereal-atom", "@thereal-atom"),
          },
          {
            id: "e-growth",
            hw: "growth engineering",
            pr: "grohth en·jih·NEER·ing",
            pos: "n.",
            senses: [
              "engineering, except the thing you're optimising is people. part of the day job.",
            ],
            see: [{ id: "e-coloop", label: "coloop ai" }],
          },
        ],
      },
      {
        letter: "h",
        entries: [
          {
            id: "e-hackathon",
            hw: "hackathon",
            pr: "HAK·uh·thon",
            pos: "n.",
            star: true,
            senses: [
              "a contest where you build something in a day or two and sleep afterwards.",
              "oscar has <mark class='hl'>won one, pitched at one, tobogganed at one, and run one</mark>.",
            ],
            see: [
              { id: "plate-ii", label: "plate ii" },
              { id: "e-zero-to-agent", label: "zero to agent" },
            ],
          },
          {
            id: "e-helio",
            hw: "helio",
            pr: "HEE·lee·oh",
            pos: "n.",
            senses: [
              "a crypto payments startup where oscar freelanced for a few months.",
              "later <mark class='hl'>acquired by moonpay for $175m</mark>. not his doing, to be clear.",
            ],
            link: ext(
              "https://www.moonpay.com/en-gb/newsroom/helio-acquisition",
              "the acquisition"
            ),
          },
          {
            id: "e-hiking",
            hw: "hiking",
            pr: "HY·king",
            pos: "n.",
            senses: ["walking, but uphill and on purpose."],
            see: [{ id: "e-mountains", label: "mountains" }],
          },
        ],
      },
    ],
  },
  {
    folio: "3",
    letters: [
      {
        letter: "i",
        entries: [
          {
            id: "e-irl",
            hw: "irl",
            pr: "eye·ar·EL",
            pos: "adv.",
            senses: ["where the good stuff happens. the natural habitat of an outpost member."],
          },
        ],
      },
      {
        letter: "k",
        entries: [
          {
            id: "e-kcl",
            hw: "kcl tech summit",
            pr: "kay·see·EL tek SUM·it",
            pos: "n.",
            star: true,
            senses: [
              "king's college london, sat 31 oct 2026. oscar spoke on the panel <mark class='hl'>“how to break into london's tech scene”</mark>, about building community as a full-time engineer who's never been to uni.",
            ],
            link: ext("https://techsummit.kcltech.co.uk/", "techsummit.kcltech.co.uk"),
          },
        ],
      },
      {
        letter: "l",
        entries: [
          {
            id: "e-linkedin",
            hw: "linkedin",
            pr: "LINKT·in",
            pos: "n.",
            senses: ["the formal one."],
            link: ext("https://linkedin.com/in/oscarfalemara", "in/oscarfalemara"),
          },
          {
            id: "e-lithuania",
            hw: "lithuania",
            pr: "lith·oo·AY·nee·uh",
            pos: "n.",
            senses: ["🇱🇹 see <a class='xr' href='#e-based-hack'>based hack</a>."],
          },
          {
            id: "e-london",
            hw: "london",
            pr: "LUN·dun",
            pos: "n.",
            senses: ["home. base of operations. where all the events happen."],
          },
        ],
      },
      {
        letter: "m",
        entries: [
          {
            id: "e-mountains",
            hw: "mountains",
            pr: "MOWN·tunz",
            pos: "n. pl.",
            senses: [
              "climbed in his time off, along with a lot of hiking, camping, skiing and rock climbing.",
            ],
            ex: "“~ are just very big boulders.”",
          },
        ],
      },
      {
        letter: "n",
        entries: [
          {
            id: "e-nature",
            hw: "nature",
            pr: "NAY·cher",
            pos: "n.",
            senses: [
              "the antidote to screens: running, hiking, camping, anything with a view at the top.",
            ],
          },
          {
            id: "e-notes-ai",
            hw: "notes ai",
            pr: "nohts ay·EYE",
            pos: "n.",
            senses: [
              "a way to talk to his obsidian notes through an llm. <mark class='hl'>the side project that got him hired at coloop</mark>.",
            ],
            link: ext("https://github.com/thereal-atom/obsidian-notes-ai", "github"),
          },
        ],
      },
      {
        letter: "o",
        entries: [
          {
            id: "e-omisphere",
            hw: "omisphere",
            pr: "OH·mih·sfeer",
            pos: "n.",
            senses: [
              "“turn every conversation into part of a collective consciousness.” his first ever hackathon, and <mark class='hl'>his first win</mark>.",
            ],
            link: ext("https://github.com/omisphere/omisphere", "github"),
          },
          {
            id: "e-openai-js",
            hw: "openai.js",
            pr: "OH·pun·ay·eye dot jay·ESS",
            pos: "n.",
            senses: [
              "a tiny node wrapper for the openai api, written at 15, back when the api first came out.",
            ],
            link: ext("https://github.com/thereal-atom/openai.js", "github"),
          },
          {
            id: "e-oscarama",
            hw: "oscarama",
            pr: "oss·kuh·RAH·muh",
            pos: "n.",
            senses: ["see the top of this dictionary. you've already read it."],
            see: [{ id: "top", label: "page i" }],
          },
          {
            id: "e-out-venturing",
            hw: "out venturing",
            pr: "owt VEN·cher·ing",
            pos: "n.",
            senses: [
              "events for people who don't like traditional networking. bouldering, ramen classes, bikepacking. “we venture, out.”",
            ],
            see: [{ id: "appendix-a", label: "appendix a" }],
          },
          {
            id: "e-outpost",
            hw: "outpost",
            pr: "OWT·pohst",
            pos: "n.",
            star: true,
            senses: [
              "<mark class='hl'>a community for those building at the frontier</mark>. 5k+ members. oscar runs it.",
            ],
            see: [{ id: "plate-iii", label: "plate iii" }],
          },
        ],
      },
    ],
  },
  {
    folio: "4",
    letters: [
      {
        letter: "p",
        entries: [
          {
            id: "e-photography",
            hw: "photography",
            pr: "fuh·TOG·ruh·fee",
            pos: "n.",
            senses: [
              "the other passion. photos, video, and anything that involves pointing a lens at something good.",
            ],
            see: [
              { id: "e-camera", label: "camera" },
              { id: "e-drone", label: "drone" },
            ],
          },
          {
            id: "e-project-liquid",
            hw: "project liquid",
            pr: "PROJ·ekt LIK·wid",
            pos: "n.",
            senses: ["a web app for delta-neutral yield farming on solana."],
            link: ext("https://github.com/thereal-atom/project-liquid", "github"),
          },
        ],
      },
      {
        letter: "r",
        entries: [
          {
            id: "e-rockets",
            hw: "rockets",
            pr: "ROK·its",
            pos: "n. pl.",
            senses: ["the eventual plan."],
            see: [{ id: "e-aerospace", label: "aerospace" }],
          },
          {
            id: "e-run-club",
            hw: "run club",
            pr: "run klub",
            pos: "n.",
            senses: ["networking, but jogging. one of outpost's many formats."],
          },
        ],
      },
      {
        letter: "s",
        entries: [
          {
            id: "e-saasalytics",
            hw: "saasalytics",
            pr: "sass·uh·LIT·iks",
            pos: "n.",
            senses: ["an ai-driven dashboard for your business data."],
            link: ext("https://saasalytics.vercel.app", "saasalytics"),
          },
          {
            id: "e-self-taught",
            hw: "self-taught",
            pr: "self·TAWT",
            pos: "adj.",
            star: true,
            senses: [
              "<mark class='hl'>started coding at about 14</mark>. no course, no degree. the internet and a lot of stubbornness.",
            ],
            see: [{ id: "e-university", label: "university" }],
          },
          {
            id: "e-solana",
            hw: "solana arb bot",
            pr: "soh·LAH·nuh arb bot",
            pos: "n.",
            senses: ["an arbitrage bot on solana. exactly what it sounds like."],
            link: ext("https://github.com/thereal-atom/arb-bot", "github"),
          },
          {
            id: "e-space",
            hw: "space",
            pr: "spayss",
            pos: "n.",
            senses: [
              "see <a class='xr' href='#e-rockets'>rockets</a>. see <a class='xr' href='#e-aerospace'>aerospace</a>. yes, again.",
            ],
          },
          {
            id: "e-stack",
            hw: "stack",
            pr: "stak",
            pos: "n.",
            senses: [
              "typescript, bun, svelte & sveltekit, next.js, rust, python, tailwind, aws, and a lot of genai.",
            ],
          },
          {
            id: "e-sunstead",
            hw: "sunstead hack",
            pr: "SUN·sted hak",
            pos: "n.",
            senses: ["🇫🇮 a hackathon in finland."],
            see: [{ id: "e-toboggan", label: "toboggan" }],
            link: ext("https://sunsteadhack.com/", "sunsteadhack.com"),
          },
        ],
      },
      {
        letter: "t",
        entries: [
          {
            id: "e-toboggan",
            hw: "toboggan",
            pr: "tuh·BOG·un",
            pos: "v.",
            senses: ["to <mark class='hl'>vibe code while sliding down a hill</mark> in finland."],
            ex: "“we didn't win, but we ~ed.”",
            see: [{ id: "e-sunstead", label: "sunstead hack" }],
          },
        ],
      },
      {
        letter: "u",
        entries: [
          {
            id: "e-university",
            hw: "university",
            pr: "yoo·nih·VUR·sih·tee",
            pos: "n.",
            star: true,
            senses: ["an institution he <mark class='hl'>did not attend</mark>."],
            see: [
              { id: "e-coloop", label: "coloop ai" },
              { id: "e-self-taught", label: "self-taught" },
              { id: "e-kcl", label: "kcl tech summit" },
            ],
          },
        ],
      },
      {
        letter: "v",
        entries: [
          {
            id: "e-vercel",
            hw: "vercel",
            pr: "ver·SELL",
            pos: "n.",
            senses: ["the people behind zero to agent. oscar ran the london stop."],
            see: [{ id: "e-zero-to-agent", label: "zero to agent" }],
          },
          {
            id: "e-vibe-coding",
            hw: "vibe coding",
            pr: "VYB koh·ding",
            pos: "n.",
            senses: ["see <a class='xr' href='#e-toboggan'>toboggan</a>."],
          },
        ],
      },
      {
        letter: "x",
        entries: [
          {
            id: "e-x",
            hw: "x",
            pr: "eks",
            pos: "n.",
            senses: ["where he posts. dms are open."],
            link: ext("https://x.com/oscarfalll", "@oscarfalll"),
          },
        ],
      },
      {
        letter: "y",
        entries: [
          {
            id: "e-yc",
            hw: "yc",
            pr: "wy·SEE",
            pos: "n.",
            senses: ["y combinator. coloop ai is from the s21 batch."],
            see: [{ id: "e-coloop", label: "coloop ai" }],
          },
        ],
      },
      {
        letter: "z",
        entries: [
          {
            id: "e-zero-to-agent",
            hw: "zero to agent",
            pr: "ZEER·oh tuh AY·junt",
            pos: "n.",
            star: true,
            senses: [
              "the london stop of vercel's zero to agent hackathon, sat 2 may 2026. <mark class='hl'>organised single-handedly</mark>. his first time running one.",
            ],
            see: [{ id: "plate-iv", label: "plate iv" }],
            link: ext("/events/zero-to-agent", "the recap"),
          },
        ],
      },
    ],
  },
];

export const allLetters = "abcdefghijklmnopqrstuvwxyz".split("");
export const usedLetters = new Set(pages.flatMap((p) => p.letters.map((l) => l.letter)));

export const guideWords = (page: Page) => {
  const all = page.letters.flatMap((l) => l.entries);
  return { first: all[0].hw, last: all[all.length - 1].hw };
};
