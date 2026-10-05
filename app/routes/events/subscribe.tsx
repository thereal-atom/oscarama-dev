import { createFileRoute } from "@tanstack/react-router";
import { SubscribeForm } from "../../components/SubscribeForm";

export const Route = createFileRoute("/events/subscribe")({
  head: () => ({
    meta: [
      { title: "subscribe | events | oscarama" },
      { name: "description", content: "Get notified about upcoming events - bouldering, dinners, coworking, hackathons in London." },
      { property: "og:url", content: "https://oscarama.dev/events/subscribe" },
    ],
  }),
  component: SubscribePage,
});

function SubscribePage() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-col px-6 pt-12 pb-12 sm:w-2xl md:w-3xl">
        <h1 className="text-3xl font-bold">stay in the loop</h1>
        <p className="mt-4 text-sm text-white/70">
          get notified when I run events in London. no spam, just good times.
        </p>

        <SubscribeForm />

        <p className="mt-6 text-xs text-white/40">you can unsubscribe anytime. I respect your inbox.</p>
      </div>
    </div>
  );
}
