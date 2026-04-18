import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  environments: {
    ssr: {
      build: {
        outDir: ".output/server",
        copyPublicDir: false,
      },
    },
    client: {
      build: {
        outDir: ".output/public",
      },
    },
  },
  plugins: [
    tanstackStart({
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
});
