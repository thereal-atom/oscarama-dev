import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "Missing SANITY_STUDIO_PROJECT_ID. Copy .env.example to .env and add your Sanity project ID."
  );
}

export default defineCliConfig({
  api: {
    projectId,
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
});
