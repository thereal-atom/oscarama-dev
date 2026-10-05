import { createFileRoute } from "@tanstack/react-router";
import coolopLogo from "@/assets/logos/coloop.png";
import fanksLogo from "@/assets/logos/fanks.png";
import outBoulderingLogo from "@/assets/logos/out-buildering.png";
import demoNightsLogo from "@/assets/logos/demo-nights.jpg";
import expLogo from "@/assets/logos/exp.png";
import helioLogo from "@/assets/logos/helio.png";
import omisphereLogo from "@/assets/logos/omisphere.png";
import ycLogo from "@/assets/logos/yc.png";
import spacexLogo from "@/assets/logos/spacex.png";
import capturedAboveLogo from "@/assets/logos/capturedabove.png";
import coloopNewLogo from "@/assets/logos/coloop-new.png";
import vercelLogo from "@/assets/logos/vercel.png";
import incidentLogo from "@/assets/logos/incident.png";
import posthogLogo from "@/assets/logos/posthog.png";
import autumnLogo from "@/assets/logos/autumn.png";
import { IconLink } from "../components/IconLink";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "oscarama | software eng" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-col px-6 pt-18 pb-32 max-sm:pt-4 sm:w-2xl md:w-3xl">
        <h1 className="text-3xl font-bold">oscar falemara</h1>
        <div className="mt-8 flex flex-col">
          <p className="text-sm text-white/70">
            i'm a self-taught software engineer from 📍 London, currently working as a full-stack web dev at
            <span> </span>
            <IconLink href="https://coloop.ai" src={coolopLogo} alt="coloop ai" text="coloop ai" /> (yc s21)
          </p>
          <p className="mt-8 text-sm text-white/70">
            I also run events across the tech & AI community in London including coworking, hackathons,
            dinners, bouldering, demo nights and much more
          </p>
          <a className="mt-8 text-sm text-[#E56717] underline" href="/events">come join an event!</a>
        </div>

        <h2 className="mt-8 text-xl sm:mt-12 md:mt-16">some other things I'm working on</h2>
        <ul className="mt-8 text-sm text-white/70">
          <li>
            running bouldering events in London @
            <span> </span>
            <IconLink href="https://luma.com/outventuring" src={outBoulderingLogo} alt="outventuring" text="out venturing" />
          </li>
          <li>
            community & events @ <IconLink href="https://events.coloop.ai" src={coloopNewLogo} alt="coloopevents" text="coloop events" />
          </li>
          <li>
            helping out @ <IconLink href="https://lu.ma/ai-london" src={demoNightsLogo} alt="ai demo nights" text="ai demo nights" />
          </li>
        </ul>
        <h3 className="mt-4">past</h3>
        <ul className="mt-4 text-sm text-white/70">
          <li>
            helping build better community-brand matching @ <IconLink href="https://fanks.co" src={fanksLogo} alt="fanks" text="fanks" />
          </li>
          <li>
            built bot systems from the ground up @ <IconLink href="https://discord.gg/exp" src={expLogo} alt="EXP" text="EXP" />, with bank systems handling $100,000s of in game value, helping it grow from 2k to 45k+ members
          </li>
          <li>
            spent a few months freelancing @ a crypto payments startup, <IconLink href="https://hel.io" src={helioLogo} alt="helio" text="helio" />
          </li>
          <li>
            won my first every hackathon with <IconLink href="https://github.com/omisphere/omisphere" src={omisphereLogo} alt="OmiSphere" text="OmiSphere" /> - a project that aims to turn every conversation into part of a collective consciousness
          </li>
        </ul>

        <h2 className="mt-8 text-xl sm:mt-12 md:mt-16">fun facts about me</h2>
        <ul className="mt-8 text-sm text-white/70">
          <li>
            at age 18, before I finished high school, I joined a <IconLink href="https://www.ycombinator.com/companies/coloop" src={ycLogo} alt="YC" text="YC" /> as a full time software engineer
          </li>
          <li>
            at age 19, I've hosted & helped organise over 15 events with 300 people attending, working with companies like <IconLink href="https://vercel.com" src={vercelLogo} alt="Vercel" text="Vercel" />, <IconLink href="https://incident.io" src={incidentLogo} alt="Incident" text="Incident" />, <IconLink href="https://posthog.com" src={posthogLogo} alt="PostHog" text="PostHog" />, <IconLink href="https://useautumn.com" src={autumnLogo} alt="Autumn" text="Autumn (YC S25)" />, and more!
          </li>
          <li>
            my passion is aerospace 🚀, and I wanna start an <IconLink href="https://spacex.com" src={spacexLogo} alt="spacex" text="aerospace company" /> some day
          </li>
          <li>in my time off, I like to climb 🏔️ mountains , 🥾 hike, 🧗 boulder and rock climb</li>
          <li>
            at age 17, I spent a few months freelancing @ a crypto payments startup, <IconLink href="https://hel.io" src={helioLogo} alt="helio" text="helio" /> (which later <a href="https://www.moonpay.com/en-gb/newsroom/helio-acquisition" target="_blank" className="underline" rel="noreferrer">sold for $175m</a>)
          </li>
          <li>
            I love photography/videography, so at age 16, I started a drone business with a friend as an economic excuse to buy a drone @ <IconLink href="https://capturedabove.vercel.app" src={capturedAboveLogo} alt="captured above" text="captured above" />
          </li>
          <li>I got my first freelance client less than 5 months after I started code, when I was still 14.</li>
        </ul>

        <h2 className="mt-16 text-xl sm:mt-12 md:mt-16">let's chat</h2>
        <div className="mt-8 flex flex-col">
          <p className="text-sm text-white/70">in 2026 I'm on a mission to meet as many new people as possible.</p>
          <p className="mt-4 text-sm text-white/70">
            whether you're building something cool, exploring a wild idea, or just want to talk about rockets and climbing walls - I'm always down for a good conversation.
          </p>
          <a className="mt-4 text-sm text-[#E56717] underline" href="/chat">book a time →</a>
          <p className="mt-4 text-sm text-white/70">
            this is a convenient way to do it, but I'd honestly rather you just DM me :)<br /> <a href="https://x.com/oscarfalll" target="_blank" rel="noreferrer" className="text-[#E56717] hover:underline">Twitter</a> / <a href="https://linkedin.com/in/oscarfalemara" target="_blank" rel="noreferrer" className="text-[#E56717] hover:underline">LinkedIn</a> - DMs are open.
          </p>
        </div>
      </div>
    </div>
  );
}
