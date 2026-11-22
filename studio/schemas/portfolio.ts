import { defineArrayMember, defineField, defineType } from "sanity";

// One document holds every photo on the site, in the order they appear.
export const portfolio = defineType({
  name: "portfolio",
  title: "Photos",
  type: "document",
  fields: [
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      description: "Drag files in to add. Drag to reorder: this is the order on the site. The first portrait photo also sits beside the headline.",
      options: { layout: "grid" },
      of: [
        defineArrayMember({
          type: "image",
          fields: [defineField({ name: "caption", title: "Caption (optional)", type: "string" })],
        }),
      ],
    }),
  ],
  preview: { select: { photos: "photos" }, prepare: ({ photos }) => ({ title: "Photos", subtitle: `${photos?.length ?? 0} photos` }) },
});
