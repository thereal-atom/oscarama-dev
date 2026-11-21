// Round-3 build-time data helpers (server side only).
import { clients, contact, services } from "@/data/photos";
import { interleave, quotes } from "@/components/photos/opus/data";

export { contact, services, quotes };

/** Curated selects: one shot from each event in turn (34 total). */
export const selects = interleave();

/** Resize a picsum `/seed/x/W/H` url to width `w`, keeping aspect. */
export function sized(src: string, w: number) {
  return src.replace(/\/(\d+)\/(\d+)$/, (_, W, H) => `/${w}/${Math.round((+H * w) / +W)}`);
}

/**
 * Client logos as single-colour marks. `mask` is an alpha image usable as a CSS
 * mask (so the mark can be printed in any colour); `ratio` = width / height.
 * SpaceX AI's svg ships on a black rounded tile, so we use a tile-less copy of
 * the same paths from /public.
 */
export const logos = clients.map((c) => {
  const isSx = c.name === "SpaceX AI";
  return {
    name: c.name,
    src: c.logo.src,
    mask: isSx ? "/photos/opus/spacexai-mark.svg" : c.logo.src,
    ratio: isSx ? 512 / 240 : c.logo.width / c.logo.height,
  };
});

export const socials = [
  { label: "Instagram", handle: `@${contact.instagram}`, href: `https://instagram.com/${contact.instagram}` },
  { label: "X", handle: `@${contact.x}`, href: `https://x.com/${contact.x}` },
  { label: "Email", handle: contact.email, href: `mailto:${contact.email}` },
];
