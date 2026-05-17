import type { ImgHTMLAttributes } from "react";
import { capture } from "../lib/posthog";

type EventSeriesCardProps = {
  name: string;
  slug: string;
  logo: ImgHTMLAttributes<HTMLImageElement>["src"];
  description: string;
};

export function EventSeriesCard({ name, slug, logo, description }: EventSeriesCardProps) {
  return (
    <a
      href={`/events/${slug}`}
      className="group flex flex-row gap-4 rounded-sm border border-white/20 p-4 transition-colors hover:border-white/40"
      onClick={() => capture("event_series_clicked", { series: slug, name })}
    >
      <img src={logo} alt={name} className="h-16 w-16 rounded-sm object-contain" />
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold transition-colors group-hover:text-[#E56717]">{name}</h2>
        <p className="mt-1 text-sm text-white/70">{description}</p>
      </div>
    </a>
  );
}
