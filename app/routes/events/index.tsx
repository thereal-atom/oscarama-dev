import { createFileRoute } from "@tanstack/react-router";
import { EventSeriesCard } from "../../components/EventSeriesCard";
import { eventSeriesList } from "../../lib/event-series";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "events | oscarama" },
      { name: "description", content: "bouldering, dinners, coworking, hackathons - I like to run events in London." },
      { property: "og:url", content: "https://oscarama.dev/events" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-col px-6 pt-18 pb-32 max-sm:pt-4 sm:w-2xl md:w-3xl">
        <h1 className="text-3xl font-bold">events</h1>
        <p className="mt-4 text-sm text-white/70">
          bouldering, dinners, coworking, hackathons - I like to run events in London. sign up for some below :)
        </p>

        <div className="mt-12 flex flex-col gap-6">
          {eventSeriesList.map((series) => (
            <EventSeriesCard
              key={series.slug}
              name={series.name}
              slug={series.slug}
              logo={series.logo}
              description={series.description}
            />
          ))}
        </div>

        <a
          href="/events/subscribe"
          className="group mt-12 flex flex-col gap-2 rounded-lg border border-dashed border-white/20 p-6 transition-all hover:border-[#E56717]/50 hover:bg-white/2"
        >
          <span className="text-lg font-semibold transition-colors group-hover:text-[#E56717]">
            stay in the loop &rarr;
          </span>
          <span className="text-sm text-white/50">
            get notified about upcoming events. no spam, just good times.
          </span>
        </a>
      </div>
    </div>
  );
}
