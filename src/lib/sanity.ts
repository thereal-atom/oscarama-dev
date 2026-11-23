// Sanity read helpers for build time. The dataset is public, so no token is needed (only published docs come back).
// No client library: GROQ over plain fetch, and image URLs built from the asset ref.
export const sanity = { projectId: "9v2mhvbp", dataset: "production", apiVersion: "2025-02-19" } as const;

export async function sanityQuery<T>(query: string): Promise<T | null> {
  const url = `https://${sanity.projectId}.api.sanity.io/v${sanity.apiVersion}/data/query/${sanity.dataset}?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Sanity returned HTTP ${res.status}`);
    return ((await res.json()) as { result: T }).result;
  } catch (err) {
    // Keep the published gallery intact when its data source is unavailable during a build.
    if (import.meta.env.PROD) throw new Error("Unable to load the photography portfolio", { cause: err });
    console.warn("[sanity] query failed, using placeholder photos:", err);
    return null;
  }
}

/** "image-<hash>-<w>x<h>-<ext>" → dimensions + a CDN url builder */
export function sanityImage(ref: string) {
  const m = /^image-([a-zA-Z0-9]+)-(\d+)x(\d+)-(\w+)$/i.exec(ref);
  if (!m) return null;
  const [, id, w, h, ext] = m;
  if (!(+w > 0 && +h > 0 && Number.isSafeInteger(+w) && Number.isSafeInteger(+h))) return null;
  const base = `https://cdn.sanity.io/images/${sanity.projectId}/${sanity.dataset}/${id}-${w}x${h}.${ext}`;
  return { width: +w, height: +h, url: (width: number) => `${base}?w=${Math.min(width, +w)}&auto=format&q=80&fit=max` };
}
