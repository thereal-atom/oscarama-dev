import { notFound } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { EventPage } from "../../components/EventPage";
import { eventSeries } from "../../lib/event-series";

export const Route = createFileRoute("/events/$slug")({
  loader: ({ params }) => {
    const data = eventSeries[params.slug as keyof typeof eventSeries];

    if (!data) {
      throw notFound();
    }

    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }

    return {
      meta: [
        { title: `${loaderData.name} | events | oscarama` },
        { name: "description", content: loaderData.description },
        { property: "og:url", content: `https://oscarama.dev/events/${loaderData.slug}` },
      ],
    };
  },
  component: EventSeriesPage,
});

function EventSeriesPage() {
  const data = Route.useLoaderData();

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-col px-6 pt-18 pb-32 max-sm:pt-4 sm:w-2xl md:w-3xl">
        <EventPage
          name={data.name}
          slug={data.slug}
          logo={data.logo}
          description={data.description}
          lumaUrl={data.lumaUrl}
          lumaCalendarId={data.lumaCalendarId}
        />
      </div>
    </div>
  );
}
