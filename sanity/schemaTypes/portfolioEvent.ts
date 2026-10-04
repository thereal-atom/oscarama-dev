import { defineArrayMember, defineField, defineType } from "sanity";

const imageFields = [
  defineField({
    name: "alt",
    title: "Alternative text",
    type: "string",
    description: "Describe the image for people using a screen reader.",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "caption",
    title: "Caption",
    type: "text",
    rows: 2,
  }),
];

export const portfolioEvent = defineType({
  name: "portfolioEvent",
  title: "Portfolio event",
  type: "document",
  initialValue: {
    featured: false,
  },
  orderings: [
    {
      title: "Event date, newest first",
      name: "eventDateDesc",
      by: [{ field: "eventDate", direction: "desc" }],
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eventDate",
      title: "Event date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "client",
      title: "Client or organiser",
      type: "string",
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: [
          { title: "Photography", value: "photography" },
          { title: "Videography", value: "videography" },
        ],
        layout: "grid",
      },
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: imageFields,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      description: "Put the strongest images first; these lead the portfolio preview.",
      of: [
        defineArrayMember({
          name: "galleryImage",
          title: "Gallery image",
          type: "image",
          options: {
            hotspot: true,
          },
          fields: imageFields,
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "highlightVideo",
      title: "Highlight video",
      type: "mux.video",
      options: {
        acceptedMimeTypes: ["video/*"],
      },
    }),
    defineField({
      name: "posterTime",
      title: "Video poster time",
      type: "number",
      description: "Optional thumbnail position in seconds. Defaults to the frame selected in Mux.",
      validation: (rule) => rule.min(0),
      hidden: ({ document }) => !document?.highlightVideo,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show this event before the rest of the portfolio.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      eventDate: "eventDate",
      location: "location",
      media: "coverImage",
    },
    prepare({ title, eventDate, location, media }) {
      return {
        title,
        subtitle: [eventDate, location].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
