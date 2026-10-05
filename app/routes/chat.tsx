import { createFileRoute } from "@tanstack/react-router";
import { capture } from "../lib/posthog";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "let's chat | oscarama" },
      { name: "description", content: "I'd love to meet you. Let's grab coffee or hop on a call." },
      { property: "og:url", content: "https://oscarama.dev/chat" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-col px-6 pt-18 pb-32 max-sm:pt-4 sm:w-2xl md:w-3xl">
        <a className="text-sm text-white/50 transition-colors hover:text-white/70" href="/">
          &larr; back home
        </a>

        <h1 className="mt-8 text-3xl font-bold">let's chat</h1>

        <div className="mt-8 flex flex-col">
          <p className="text-lg text-white/90">
            in 2026 I'm on a mission to meet as many interesting people as possible.
          </p>
          <p className="mt-4 text-sm text-white/70">
            whether you're building something cool, exploring a wild idea, or just want to talk about
            rockets and climbing walls - I'm always down for a good conversation.
          </p>
        </div>

        <a
          className="mt-10 inline-flex w-full items-center justify-center rounded-lg bg-[#E56717] px-8 py-4 font-semibold text-white transition-colors duration-200 hover:bg-[#c9550f] sm:w-fit"
          href="https://cal.oscarama.dev"
          onClick={() => capture("lets_chat_clicked", { source: "chat_page" })}
        >
          book a time to chat
        </a>

        <p className="mt-10 text-sm text-white/70">
          this is a convenient way to do it, but I'd honestly rather you just DM me :p<br /> <a href="https://x.com/oscarfalll" target="_blank" rel="noreferrer" className="text-[#E56717] hover:underline" onClick={() => capture("social_link_clicked", { platform: "X", source: "chat_page" })}>Twitter</a> or <a href="https://linkedin.com/in/oscarfalemara" target="_blank" rel="noreferrer" className="text-[#E56717] hover:underline" onClick={() => capture("social_link_clicked", { platform: "LinkedIn", source: "chat_page" })}>LinkedIn</a> - DMs are always open. or if I know you, then WhatsApp is best :)
        </p>
        <p className="mt-6 text-sm text-white/70">
          I also run events in London - <a href="/events" target="_blank" className="text-[#E56717] hover:underline" rel="noreferrer">sign up</a> to one!
        </p>

        <div className="mt-16 border-t border-white/10 pt-8">
          <h2 className="text-xl font-semibold">how it works</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#E56717]">01</span>
              <h3 className="mt-2 text-sm font-semibold">pick a time</h3>
              <p className="mt-1 text-sm text-white/60">choose a time slot that works for you</p>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#E56717]">02</span>
              <h3 className="mt-2 text-sm font-semibold">choose the format</h3>
              <p className="mt-1 text-sm text-white/60">coffee in London or video call from anywhere</p>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#E56717]">03</span>
              <h3 className="mt-2 text-sm font-semibold">let's talk</h3>
              <p className="mt-1 text-sm text-white/60">no agenda needed - just good conversation</p>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <h2 className="text-xl font-semibold">things I love talking about</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-white">aerospace</h3>
              <p className="text-sm text-white/60">rockets, drones, satellites - how they fly, how they're built, and the future of space</p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-white">AI & agents</h3>
              <p className="text-sm text-white/60">AGI timelines, fine-tuning, architecture, and actually useful applications</p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-white">embedded systems</h3>
              <p className="text-sm text-white/60">microcontrollers, RTOS, signal processing - the stuff that makes hardware tick</p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-white">the outdoors</h3>
              <p className="text-sm text-white/60">mountaineering, bouldering, ultralight hiking - bonus points if you have beta</p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-white">blockchain & crypto</h3>
              <p className="text-sm text-white/60">ZK proofs, token economics, actual real-world payment use cases</p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-white">everything else</h3>
              <p className="text-sm text-white/60">quantum physics, nuclear fusion, neuroscience, or whatever you're excited about</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
