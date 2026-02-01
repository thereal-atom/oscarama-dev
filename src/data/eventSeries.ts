import outventuringLogo from "@/assets/logos/out-buildering.png";
import coloopLogo from "@/assets/logos/coloop-new.png";

export const eventSeries = {
  outventuring: {
    name: "Out Venturing",
    slug: "outventuring",
    logo: outventuringLogo,
    description:
      "we don't like traditional networking events. come meet interesting people in interesting places instead. bouldering, ramen classes, bikepacking - you name it. we venture, out.",
    lumaUrl: "https://lu.ma/outventuring",
    lumaCalendarId: "cal-XR9yMbuVv84aRKj",
  },
  coloop: {
    name: "CoLoop Events",
    slug: "coloop",
    logo: coloopLogo,
    description:
      "community events, meetups, and gatherings hosted by the Coloop team.",
    lumaUrl: "https://lu.ma/coloop",
    lumaCalendarId: "cal-iTDg1jJCygIbf5u",
  },
} as const;

export const eventSeriesList = Object.values(eventSeries);
