import { useState } from "react";

const eventsList = [
  { label: "🧗 bouldering", value: "bouldering" },
  { label: "🍽️ dinners", value: "dinners" },
  { label: "💻 hackathons", value: "hackathons" },
  { label: "⛺ camping & hiking", value: "camping & hiking" },
  { label: "✨ other", value: "other" },
];

const channelsList = [
  { label: "whatsapp", value: "whatsapp", icon: "whatsapp" },
  { label: "slack", value: "slack", icon: "slack" },
  { label: "discord", value: "discord", icon: "discord" },
  { label: "other", value: "other", icon: "other" },
] as const;

export function SubscribeForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function toggleValue(value: string, values: string[], setValues: (values: string[]) => void) {
    if (values.includes(value)) {
      setValues(values.filter((item) => item !== value));
      return;
    }

    setValues([...values, value]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/subscribe", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { success: boolean; error?: string };

      if (result.success) {
        setMessage({ text: "you're in! check your inbox soon.", type: "success" });
        setName("");
        setEmail("");
        setInterests([]);
        setChannels([]);
        setNotes("");
        event.currentTarget.reset();
      } else {
        setMessage({ text: result.error || "something went wrong", type: "error" });
      }
    } catch {
      setMessage({ text: "something went wrong. please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm text-white/70">name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="what should I call you?"
          required
          className="w-full rounded-md border border-white/20 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-white/50 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm text-white/70">email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-md border border-white/20 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-white/50 focus:outline-none"
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm text-white/70">what kind of events interest you?</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {eventsList.map((eventOption) => (
            <label key={eventOption.value} className="group cursor-pointer">
              <input
                type="checkbox"
                name="interests"
                value={eventOption.value}
                checked={interests.includes(eventOption.value)}
                onChange={() => toggleValue(eventOption.value, interests, setInterests)}
                className="peer sr-only"
              />
              <span className="inline-block select-none rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/70 transition-all hover:border-white/40 peer-checked:border-[#E56717] peer-checked:bg-[#E56717] peer-checked:text-white">
                {eventOption.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm text-white/70">
          preferred community comms channel? <span className="text-white/40">(optional)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {channelsList.map((channel) => (
            <label key={channel.value} className="group cursor-pointer">
              <input
                type="checkbox"
                name="channels"
                value={channel.value}
                checked={channels.includes(channel.value)}
                onChange={() => toggleValue(channel.value, channels, setChannels)}
                className="peer sr-only"
              />
              <span className="inline-flex select-none items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/70 transition-all hover:border-white/40 peer-checked:border-[#E56717] peer-checked:bg-[#E56717] peer-checked:text-white">
                {channel.icon === "whatsapp" ? <span className="text-xs">💬</span> : null}
                {channel.icon === "slack" ? <span className="text-xs">#</span> : null}
                {channel.icon === "discord" ? <span className="text-xs">🎮</span> : null}
                {channel.icon === "other" ? <span className="text-xs">✨</span> : null}
                {channel.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="text-sm text-white/70">
          anything else? <span className="text-white/40">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="ideas for events, how you found me, or just say hi..."
          className="w-full resize-none rounded-md border border-white/20 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-white/50 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-[#E56717] px-6 py-3 font-semibold text-white transition-all hover:bg-[#E56717]/80 focus:ring-2 focus:ring-[#E56717]/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "subscribing..." : "subscribe"}
      </button>

      {message ? (
        <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
