import { describe, expect, it } from "vitest";
import { announcementSchema, articleSchema } from "./content";

const announcement = {
  title: "Wellness Week",
  description: "Talks and workshops.",
  location: "Gym",
  start_date: "2026-09-20T01:00:00.000Z",
  end_date: "2026-09-20T04:00:00.000Z",
  announcement_image: "",
};

describe("announcementSchema", () => {
  it("accepts a valid event", () => {
    expect(announcementSchema.safeParse(announcement).success).toBe(true);
  });

  // Nothing stopped an event from ending before it started until the database
  // constraint refused it with a raw error.
  it("rejects an end before the start, on the end field", () => {
    const result = announcementSchema.safeParse({
      ...announcement,
      end_date: "2026-09-19T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].path).toEqual(["end_date"]);
  });
});

describe("articleSchema", () => {
  it("allows longer article summaries than the old 500-character cap", () => {
    const result = articleSchema.safeParse({
      title: "T",
      content: "x".repeat(1500),
      link: "https://example.com",
      author_name: "A",
      publisher_name: "P",
      emotional_status_id: "11111111-1111-1111-1111-000000000001",
      article_image: "",
    });
    expect(result.success).toBe(true);
  });
});
