// Lightly edited, lowercase blurbs for the four event series (source: src/data/eventSeries.ts).
const blurbs: Record<string, string> = {
  "oscaramas-stuff":
    "a community for london's finest and most interested tech & ai builders and founders. hackathons, coworking, dinners and much more.",
  coloop:
    "community events, meetups and gatherings hosted by the coloop team, from coworking days to the coloop sports club.",
  "demo-nights":
    "a community of engineers, builders and super early founders. on demo nights, a curated set of builders show off what they've been making in ai.",
  outventuring:
    "we don't like traditional networking events. come meet interesting people in interesting places instead: bouldering, ramen classes, bikepacking, you name it. we venture, out.",
};

export const blurb = (slug: string, fallback: string) => blurbs[slug] ?? fallback.toLowerCase();

// luma's embed supports a light theme, which suits a white page
export const lumaEmbed = (calendarId: string) =>
  `https://luma.com/embed/calendar/${calendarId}/events?lt=light`;
