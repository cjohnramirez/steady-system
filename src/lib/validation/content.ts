import { z } from "zod";

const text = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

const image = z.union([z.literal(""), z.url("Upload the image again")]);

export const announcementSchema = z
  .object({
    title: text("Title", 120),
    description: z
      .string()
      .trim()
      .max(1000, "Keep the description under 1000 characters"),
    location: text("Location", 120),
    start_date: z.iso.datetime({
      offset: true,
      message: "Choose a start date and time",
    }),
    end_date: z.iso.datetime({
      offset: true,
      message: "Choose an end date and time",
    }),
    announcement_image: image,
  })
  .refine((v) => new Date(v.end_date) >= new Date(v.start_date), {
    message: "The event can't end before it starts",
    path: ["end_date"],
  });

export const articleSchema = z.object({
  title: text("Title", 160),
  content: text("Summary", 2000),
  link: z.url("Enter the full link, starting with https://"),
  author_name: text("Author", 120),
  publisher_name: text("Publisher", 120),
  emotional_status_id: z.guid("Choose a mood"),
  article_image: image,
});

export const playlistSchema = z.object({
  title: text("Title", 120),
  link: z.url("Enter the full link, starting with https://"),
  creator: text("Creator", 120),
  emotional_status_id: z.guid("Choose a mood"),
  image,
});

export type AnnouncementInput = z.input<typeof announcementSchema>;
export type ArticleInput = z.input<typeof articleSchema>;
export type PlaylistInput = z.input<typeof playlistSchema>;
