import { createApp } from "vinxi";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
    },
    {
      name: "ssr",
      type: "http",
      target: "server",
      handler: "./app/ssr.tsx",
      base: "/",
      plugins: () => [
        ...tanstackStart({
          srcDirectory: "app",
          router: {
            routesDirectory: "routes",
            generatedRouteTree: "routeTree.gen.ts",
          },
          client: {
            entry: "./client.tsx",
          },
          server: {
            entry: "./ssr.tsx",
          },
        }),
      ],
    },
  ],
});
