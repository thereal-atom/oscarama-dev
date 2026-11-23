import { eventSeriesList } from "@/data/eventSeries";

// Short board copy for each series, paraphrased from its own description,
// plus a lightly tidied, lowercase version of each description.
const meta: Record<string, { what: string; tag: string; blurb: string }> = {
  "oscaramas-stuff": {
    what: "hacks · dinners · cowork",
    tag: "builders & founders",
    blurb:
      "a community for london's finest and most interested tech & ai builders and founders. hackathons, coworking, dinners and much more.",
  },
  coloop: {
    what: "meetups · gatherings",
    tag: "hosted by coloop",
    blurb: "community events, meetups and gatherings hosted by the coloop team.",
  },
  "demo-nights": {
    what: "builders show & tell",
    tag: "ai demos",
    blurb:
      "a community of engineers, builders and super early founders. we run nights where a curated set of builders show off what they've been working on in ai.",
  },
  outventuring: {
    what: "boulder · ramen · bikes",
    tag: "anti-networking",
    blurb:
      "we don't like traditional networking events. come meet interesting people in interesting places instead. bouldering, ramen classes, bikepacking, you name it. we venture, out.",
  },
};

export const gates = eventSeriesList.map((s, i) => ({
  ...s,
  gate: `G${i + 1}`,
  what: meta[s.slug]?.what ?? "events",
  tag: meta[s.slug]?.tag ?? "",
  blurb: meta[s.slug]?.blurb ?? s.description,
}));

export type Gate = (typeof gates)[number];
