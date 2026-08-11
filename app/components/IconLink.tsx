import { capture } from "../lib/posthog";

type IconLinkProps = {
  href: string;
  src: string;
  alt: string;
  text: string;
};

export function IconLink({ href, src, alt, text }: IconLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-1 align-middle text-white/70 underline dark:text-white transition-all duration-200"
      onClick={() => capture("icon_link_clicked", { text, href })}
    >
      <img className="mb-0.5 h-4 w-4 rounded-xs object-contain" src={src} alt={alt} />
      <span>{text}</span>
    </a>
  );
}
