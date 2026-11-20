import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { muxInput } from "sanity-plugin-mux-input";
import { schemaTypes } from "./sanity/schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

if (!projectId) {
  throw new Error(
    "Missing SANITY_STUDIO_PROJECT_ID. Copy .env.example to .env and add your Sanity project ID."
  );
}

export default defineConfig({
  name: "default",
  title: "oscarama portfolio",
  projectId,
  dataset,
  plugins: [
    structureTool(),
    muxInput({
      acceptedMimeTypes: ["video/*"],
      defaultPublic: true,
      defaultSigned: false,
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
