import type { SanityImageSource } from "@sanity/image-url";
import { getSanityClient, getSanityImageUrl, type SanityEnvironment } from "@/lib/sanity";

export interface PortfolioImage {
  key: string;
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  lqip?: string;
}

export interface PortfolioVideo {
  playbackId: string;
  title?: string;
  posterTime?: number;
}

export interface PortfolioEvent {
  id: string;
  title: string;
  slug: string;
  eventDate: string;
  location: string;
  client?: string;
  summary: string;
  services: string[];
  coverImage?: PortfolioImage;
  gallery: PortfolioImage[];
  highlightVideo?: PortfolioVideo;
  featured: boolean;
}

export function portfolioOriginalImageUrl(url: string): string {
  try {
    const imageUrl = new URL(url);
    if (imageUrl.hostname !== "cdn.sanity.io") return url;

    // Serve the uploaded asset without resizing, cropping or recompression.
    imageUrl.search = "";
    return imageUrl.toString();
  } catch {
    return url;
  }
}

export function portfolioImageUrl(url: string, width: number, quality = 88): string {
  const normalizedWidth = Math.round(width);
  const normalizedQuality = Math.round(quality);

  if (
    !Number.isFinite(normalizedWidth) ||
    normalizedWidth < 1 ||
    !Number.isFinite(normalizedQuality) ||
    normalizedQuality < 1
  ) {
    return url;
  }

  try {
    const imageUrl = new URL(url);
    if (imageUrl.hostname !== "cdn.sanity.io") return url;

    imageUrl.searchParams.set("w", String(normalizedWidth));
    imageUrl.searchParams.set("fit", "max");
    imageUrl.searchParams.set("auto", "format");
    imageUrl.searchParams.set("q", String(Math.min(normalizedQuality, 100)));
    return imageUrl.toString();
  } catch {
    return url;
  }
}

interface SanityImageValue {
  _key?: string;
  alt?: string;
  caption?: string;
  asset?: {
    _id?: string;
    _ref?: string;
  };
  assetUrl?: string;
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  width?: number;
  height?: number;
  lqip?: string;
}

interface SanityVideoValue {
  asset?: {
    playbackId?: string;
    thumbTime?: number;
  };
}

interface SanityPortfolioEvent {
  _id?: string;
  title?: string;
  slug?: string;
  eventDate?: string;
  location?: string;
  client?: string;
  summary?: string;
  services?: unknown[];
  coverImage?: SanityImageValue;
  gallery?: SanityImageValue[];
  highlightVideo?: SanityVideoValue;
  posterTime?: number;
  featured?: boolean;
}

const IMAGE_PROJECTION = `
  _key,
  alt,
  caption,
  asset,
  crop,
  hotspot,
  "assetUrl": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip
`;

const BASE_EVENT_PROJECTION = `
  _id,
  title,
  "slug": slug.current,
  eventDate,
  location,
  client,
  summary,
  "services": coalesce(services, []),
  coverImage {
    ${IMAGE_PROJECTION}
  },
  highlightVideo {
    "asset": asset-> {
      playbackId,
      thumbTime
    }
  },
  posterTime,
  "featured": coalesce(featured, false)
`;

export const portfolioEventsQuery = `
  *[_type == "portfolioEvent" && defined(slug.current)]
    | order(featured desc, eventDate desc) {
      ${BASE_EVENT_PROJECTION},
      "gallery": gallery[0...4] {
        ${IMAGE_PROJECTION}
      }
    }
`;

export const portfolioEventBySlugQuery = `
  *[_type == "portfolioEvent" && slug.current == $slug][0] {
    ${BASE_EVENT_PROJECTION},
    gallery[] {
      ${IMAGE_PROJECTION}
    }
  }
`;

function cleanString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const cleaned = value.trim();
  return cleaned || undefined;
}

function positiveNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

function nonNegativeNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function normalizeImage(
  image: SanityImageValue | undefined,
  fallbackAlt: string,
  env?: SanityEnvironment
): PortfolioImage | undefined {
  if (!image) return undefined;

  const url =
    getSanityImageUrl(image as SanityImageSource, env) ?? cleanString(image.assetUrl) ?? undefined;
  if (!url) return undefined;

  const key =
    cleanString(image._key) ??
    cleanString(image.asset?._ref) ??
    cleanString(image.asset?._id) ??
    url;
  const caption = cleanString(image.caption);
  const width = positiveNumber(image.width);
  const height = positiveNumber(image.height);
  const lqip = cleanString(image.lqip);

  return {
    key,
    url,
    alt: cleanString(image.alt) ?? fallbackAlt,
    ...(caption ? { caption } : {}),
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(lqip ? { lqip } : {}),
  };
}

function normalizeEvent(
  event: SanityPortfolioEvent,
  env?: SanityEnvironment
): PortfolioEvent | null {
  const title = cleanString(event.title);
  const slug = cleanString(event.slug);
  if (!title || !slug) return null;

  const client = cleanString(event.client);
  const gallery = (Array.isArray(event.gallery) ? event.gallery : [])
    .map((image) => normalizeImage(image, `${title} event photograph`, env))
    .filter((image): image is PortfolioImage => Boolean(image));

  const playbackId = cleanString(event.highlightVideo?.asset?.playbackId);
  const posterTime =
    nonNegativeNumber(event.posterTime) ??
    nonNegativeNumber(event.highlightVideo?.asset?.thumbTime);
  const highlightVideo = playbackId
    ? {
        playbackId,
        title,
        ...(posterTime !== undefined ? { posterTime } : {}),
      }
    : undefined;

  const services = Array.from(
    new Set(
      (Array.isArray(event.services) ? event.services : [])
        .map(cleanString)
        .filter((service): service is string => Boolean(service))
    )
  );

  return {
    id: cleanString(event._id) ?? slug,
    title,
    slug,
    eventDate: cleanString(event.eventDate) ?? "",
    location: cleanString(event.location) ?? "",
    ...(client ? { client } : {}),
    summary: cleanString(event.summary) ?? "",
    services,
    coverImage: normalizeImage(event.coverImage, `${title} cover photograph`, env),
    gallery,
    ...(highlightVideo ? { highlightVideo } : {}),
    featured: event.featured === true,
  };
}

export async function getPortfolioEvents(env?: SanityEnvironment): Promise<PortfolioEvent[]> {
  const client = getSanityClient(env);
  if (!client) return [];

  try {
    const events = await client.fetch<SanityPortfolioEvent[]>(portfolioEventsQuery);
    if (!Array.isArray(events)) return [];

    return events
      .map((event) => normalizeEvent(event, env))
      .filter((event): event is PortfolioEvent => Boolean(event));
  } catch (error) {
    console.warn("Unable to load portfolio events from Sanity.", error);
    return [];
  }
}

export async function getPortfolioEvent(
  slug: string,
  env?: SanityEnvironment
): Promise<PortfolioEvent | null> {
  const normalizedSlug = cleanString(slug);
  if (!normalizedSlug) return null;

  const client = getSanityClient(env);
  if (!client) return null;

  try {
    const event = await client.fetch<SanityPortfolioEvent | null>(portfolioEventBySlugQuery, {
      slug: normalizedSlug,
    });

    return event ? normalizeEvent(event, env) : null;
  } catch (error) {
    console.warn(`Unable to load portfolio event "${normalizedSlug}" from Sanity.`, error);
    return null;
  }
}

export type { SanityEnvironment } from "@/lib/sanity";
