// Poster copy for the four event series. Facts come from src/data/eventSeries.ts;
// taglines are short poster lines distilled from each series' own description.
import { eventSeriesList } from "@/data/eventSeries";

const posterCopy: Record<string, { tagline: string; billing: string[] }> = {
  "oscaramas-stuff": {
    tagline: "london's finest tech & ai builders and founders. in one room.",
    billing: ["hackathons", "and", "coworking", "and", "dinners"],
  },
  coloop: {
    tagline: "community events, meetups and gatherings from the coloop team.",
    billing: ["meetups", "and", "gatherings", "hosted by", "coloop ai"],
  },
  "demo-nights": {
    tagline: "a curated set of builders show off what they've been working on in ai.",
    billing: ["engineers", "and", "builders", "and", "super early founders"],
  },
  outventuring: {
    tagline: "we don't like traditional networking events. we venture, out.",
    billing: ["bouldering", "and", "ramen", "and", "bikepacking"],
  },
};

export const screenings = eventSeriesList.map((s, i) => ({
  ...s,
  screen: i + 1,
  tagline: posterCopy[s.slug]?.tagline ?? s.description,
  billing: posterCopy[s.slug]?.billing ?? [],
}));
