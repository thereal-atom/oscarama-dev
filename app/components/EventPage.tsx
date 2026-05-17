import type { ImgHTMLAttributes } from "react";
import { capture } from "../lib/posthog";

type EventPageProps = {
  name: string;
  slug: string;
  logo: ImgHTMLAttributes<HTMLImageElement>["src"];
  description: string;
  lumaUrl: string;
  lumaCalendarId: string;
};

export function EventPage({ name, slug, logo, description, lumaUrl, lumaCalendarId }: EventPageProps) {
  const lumaDisplayUrl = lumaUrl.replace("https://", "");

  return (
    <>
      <a
        href="/events"
        className="mb-4 text-sm text-white/50 transition-colors hover:text-white/70"
        onClick={() => capture("event_back_clicked", { from: slug })}
      >
        &larr; all events
      </a>

      <div className="flex flex-row items-center gap-4">
        <img src={logo} alt={name} className="h-16 w-16 rounded-sm object-contain" />
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <a
            href={lumaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#E56717] hover:underline"
            onClick={() => capture("event_luma_link_clicked", { series: slug, location: "header" })}
          >
            {lumaDisplayUrl}
          </a>
        </div>
      </div>

      <p className="mt-6 text-sm text-white/70">{description}</p>

      <h2 className="mt-12 mb-6 text-xl">upcoming</h2>

      <div className="z-10 w-full overflow-hidden rounded-sm border border-white/20 bg-[#1a1a1a]">
        <iframe
          src={`https://luma.com/embed/calendar/${lumaCalendarId}/events`}
          width="100%"
          height="600"
          style={{ border: "none", background: "transparent" }}
          allowFullScreen
          aria-hidden="false"
          tabIndex={0}
          title={`${name} events`}
        />
      </div>

      <p className="mt-4 text-sm text-white/50">
        View all events and RSVP on{" "}
        <a
          href={lumaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E56717] hover:underline"
          onClick={() => capture("event_luma_link_clicked", { series: slug, location: "footer" })}
        >
          Luma
        </a>
      </p>
    </>
  );
}
