import { defineArrayMember, defineField, defineType } from "sanity";

// One document holds every photo on the site, in the order they appear.
export const portfolio = defineType({
  name: "portfolio",
  title: "Photos",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero photo",
      type: "image",
      description: "The photo beside the headline (ideally one of you). Set the hotspot to keep the important part in frame when it's cropped.",
      options: { hotspot: true },
    }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      description: "Open a photo to mark it for selects. Drag to set the order on the site.",
      options: { layout: "grid" },
      of: [
        defineArrayMember({
          type: "image",
          fields: [
            defineField({ name: "caption", title: "Caption (optional)", type: "string" }),
            defineField({
              name: "showInSelects",
              title: "Show in selects",
              type: "boolean",
              initialValue: false,
              description: "Include this photo in the selects grid and viewer.",
            }),
          ],
        }),
      ],
    }),
  ],
  preview: { select: { photos: "photos" }, prepare: ({ photos }) => ({ title: "Photos", subtitle: `${photos?.length ?? 0} photos` }) },
});
