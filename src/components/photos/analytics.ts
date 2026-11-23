declare global {
  interface Window {
    posthog?: { capture(event: string, properties: Record<string, unknown>): void };
  }
}

export function capturePhotoEvent(event: string, properties: Record<string, unknown>) {
  try {
    window.posthog?.capture(`photography_${event}`, properties);
  } catch {
    // Visitors can still browse and contact Oscar if analytics is unavailable.
  }
}
