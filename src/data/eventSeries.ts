import oscaramaLogo from "@/assets/logos/oscarama.png";
import outventuringLogo from "@/assets/logos/out-buildering.png";
import coloopLogo from "@/assets/logos/coloop-new.png";
import demoNightsLogo from "@/assets/logos/demo-nights.jpg";

export const eventSeries = {
  ["oscaramas-stuff"]: {
    name: "oscarama's stuff",
    slug: "oscaramas-stuff",
    logo: oscaramaLogo,
    description:
      "a community for London's finest and most interested tech & AI builders and founders. hackathons, coworking, dinners and much more",
    lumaUrl: "https://luma.com/oscarama",
    lumaCalendarId: "cal-fTicl1ALRR1FGZt",
  },
  coloop: {
    name: "CoLoop Events",
    slug: "coloop",
    logo: coloopLogo,
    description: "community events, meetups, and gatherings hosted by the Coloop team.",
    lumaUrl: "https://lu.ma/coloop",
    lumaCalendarId: "cal-iTDg1jJCygIbf5u",
  },
  ["demo-nights"]: {
    name: "AI Demo Nights",
    slug: "demo-nights",
    logo: demoNightsLogo,
    description:
      "a community of engineers, builders & super early founders. we run nights where people a curated set of builders show off what they have been working on in the AI space.",
    lumaUrl: "https://lu.ma/londonmaxxing-ai",
    lumaCalendarId: "cal-BwhGlJaFM1pBN79",
  },
  outventuring: {
    name: "Out Venturing",
    slug: "outventuring",
    logo: outventuringLogo,
    description:
      "we don't like traditional networking events. come meet interesting people in interesting places instead. bouldering, ramen classes, bikepacking - you name it. we venture, out.",
    lumaUrl: "https://lu.ma/outventuring",
    lumaCalendarId: "cal-XR9yMbuVv84aRKj",
  },
} as const;

export const eventSeriesList = Object.values(eventSeries);
