import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { portfolio } from "./schemas/portfolio";

const SINGLETON = "portfolio";

export default defineConfig({
  name: "default",
  title: "oscarama.dev",
  projectId: "9v2mhvbp",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([S.listItem().title("Photos").id(SINGLETON).child(S.document().schemaType(SINGLETON).documentId(SINGLETON).title("Photos"))]),
    }),
  ],
  schema: {
    types: [portfolio],
    templates: (templates) => templates.filter((t) => t.schemaType !== SINGLETON),
  },
  document: {
    actions: (prev, ctx) => (ctx.schemaType === SINGLETON ? prev.filter((a) => !["duplicate", "delete", "unpublish"].includes(a.action ?? "")) : prev),
  },
});
