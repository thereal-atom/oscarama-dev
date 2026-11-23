import { eventSeriesList } from "@/data/eventSeries";

// same four series as v1 (names, logos, luma links all come from the shared data file);
// only the blurbs are lightly reworded for this version's voice.
const blurbs: Record<string, string> = {
  "oscaramas-stuff":
    "a community for london's finest and most interested tech & ai builders and founders. hackathons, coworking, dinners and much more.",
  coloop: "community events, meetups and gatherings hosted by the coloop team.",
  "demo-nights":
    "a community of engineers, builders & super early founders. we run nights where a curated set of builders show off what they've been working on in the ai space.",
  outventuring:
    "we don't like traditional networking events. come meet interesting people in interesting places instead. bouldering, ramen classes, bikepacking, you name it. we venture, out.",
};

export const series = eventSeriesList.map((s) => ({
  ...s,
  description: blurbs[s.slug] ?? s.description.toLowerCase(),
}));
