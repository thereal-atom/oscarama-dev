import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

const API_VERSION = "2025-02-19";
const DEFAULT_DATASET = "production";
const DEFAULT_IMAGE_WIDTH = 2000;

export interface SanityEnvironment {
  PUBLIC_SANITY_PROJECT_ID?: string;
  PUBLIC_SANITY_DATASET?: string;
  SANITY_PROJECT_ID?: string;
  SANITY_DATASET?: string;
  SANITY_API_READ_TOKEN?: string;
}

export interface SanityConfig {
  projectId: string;
  dataset: string;
  token?: string;
}

const clients = new Map<string, SanityClient>();

function cleanString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const cleaned = value.trim();
  return cleaned || undefined;
}

export function resolveSanityConfig(env?: SanityEnvironment): SanityConfig | null {
  const buildEnv = import.meta.env;
  const projectId = cleanString(
    env?.SANITY_PROJECT_ID ?? env?.PUBLIC_SANITY_PROJECT_ID ?? buildEnv.PUBLIC_SANITY_PROJECT_ID
  );

  if (!projectId) return null;

  const dataset =
    cleanString(env?.SANITY_DATASET ?? env?.PUBLIC_SANITY_DATASET) ??
    cleanString(buildEnv.PUBLIC_SANITY_DATASET) ??
    DEFAULT_DATASET;
  const token = cleanString(env?.SANITY_API_READ_TOKEN ?? buildEnv.SANITY_API_READ_TOKEN);

  return {
    projectId,
    dataset,
    ...(token ? { token } : {}),
  };
}

export function getSanityClient(env?: SanityEnvironment): SanityClient | null {
  const config = resolveSanityConfig(env);
  if (!config) return null;

  const cacheKey = `${config.projectId}:${config.dataset}:${config.token ?? "public"}`;
  const cached = clients.get(cacheKey);
  if (cached) return cached;

  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: API_VERSION,
    perspective: "published",
    token: config.token,
    useCdn: !config.token,
  });

  clients.set(cacheKey, client);
  return client;
}

export function getSanityImageUrl(
  source: SanityImageSource,
  env?: SanityEnvironment,
  width = DEFAULT_IMAGE_WIDTH
): string | null {
  const config = resolveSanityConfig(env);
  if (!config) return null;

  try {
    return createImageUrlBuilder(config)
      .image(source)
      .width(Math.max(1, Math.round(width)))
      .fit("max")
      .auto("format")
      .quality(88)
      .url();
  } catch {
    return null;
  }
}
