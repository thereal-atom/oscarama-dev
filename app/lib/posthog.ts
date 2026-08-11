export function capture(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.posthog?.capture(eventName, properties);
}

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}
