import { z } from "zod";

export const announcementInsertFormSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description must not exceed 500 characters"),
  end_date: z.iso.datetime("Invalid date format"),
  location: z.string().min(1, "Location is required").max(100, "Location must not exceed 100 characters"),
  start_date: z.iso.datetime("Invalid date format"),
  title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
});

export const articleInsertFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
  content: z.string().min(1, "Content is required").max(500, "Content must not exceed 500 characters"),
  author_name: z.string().min(1, "Author name is required").max(500, "Author name must not exceed 100 characters"),
  emotional_status_id: z.uuid(),
  publisher_name: z.string().min(1, "Publisher name is required").max(100, "Publisher name must not exceed 100 characters"),
  link: z.url("Article link must be a valid URL"),
});

export const playlistInsertFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
  link: z.url("Article link must be a valid URL"),
  creator: z.string().min(1, "Creator name is required").max(100, "Creator name must not exceed 100 characters"),
  emotional_status_id: z.uuid(),
});

