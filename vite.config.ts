import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouterGenerator } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tanstackRouterGenerator({ target: "react", routesDirectory: "app/routes" }), tsConfigPaths(), react(), tailwindcss()],
});
