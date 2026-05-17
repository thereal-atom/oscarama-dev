import oscaramaLogo from "@/assets/oscarama.png";
import githubIcon from "@/assets/socials/github.svg";
import linkedinIcon from "@/assets/socials/linkedin.svg";
import xIcon from "@/assets/socials/x.svg";
import calendarIcon from "@/assets/socials/cal-com.svg";
import { capture } from "../lib/posthog";

const socialLinks = [
  { href: "https://cal.oscarama.dev", icon: calendarIcon, label: "Calendar" },
  { href: "https://github.com/thereal-atom", icon: githubIcon, label: "GitHub" },
  { href: "https://linkedin.com/in/oscarfalemara", icon: linkedinIcon, label: "LinkedIn" },
  { href: "https://x.com/oscarfalll", icon: xIcon, label: "X" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="flex justify-center pb-4">
        <div className="relative flex w-full items-center justify-between bg-[#101010] px-6 pt-8 pb-4 sm:w-2xl md:w-3xl">
          <div className="flex flex-row items-center">
            <a href="/" className="gap-2 transition-opacity hover:opacity-80">
              <img
                src={oscaramaLogo}
                alt="oscarama"
                className="h-8 w-8 rounded-sm max-[32rem]:h-6 max-[32rem]:w-6"
              />
            </a>
            <div className="ml-8 flex flex-row items-center gap-6 max-[32rem]:ml-4 max-[32rem]:gap-4">
              <a href="/events" className="text-sm transition-opacity hover:opacity-70 max-[32rem]:text-xs">
                events
              </a>
              <a href="/chat" className="text-sm transition-opacity hover:opacity-70 max-[32rem]:text-xs">
                let's chat
              </a>
            </div>
          </div>
          <nav className="relative flex items-center gap-6 max-[32rem]:gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity duration-200 hover:opacity-70"
                onClick={() => capture("social_link_clicked", { platform: link.label })}
              >
                <img src={link.icon} alt={link.label} className="h-5 w-auto max-[32rem]:h-4" />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
