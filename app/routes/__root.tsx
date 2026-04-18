import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Header } from "../components/Header";
import { site } from "../lib/site";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "description", content: site.description },
      { title: site.title },
      { property: "og:type", content: "website" },
      { property: "og:url", content: site.ogUrl },
      { property: "og:title", content: site.title },
      { property: "og:description", content: site.description },
      { property: "og:image", content: new URL(site.ogImage, site.ogUrl).href },
      { property: "og:site_name", content: site.name },
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:url", content: site.ogUrl },
      { property: "twitter:title", content: site.title },
      { property: "twitter:description", content: site.description },
      { property: "twitter:image", content: new URL(site.ogImage, site.ogUrl).href },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
      <HeadContent />
    </>
  );
}
