import { describe, expect, it } from "vitest";
import { addToFeed, applyUpdate, FEED_SIZE, removeFromFeed } from "./feed";
import type { Notification, NotificationFeed } from "./queries";

const note = (id: string, read = false): Notification => ({
  id,
  user_id: "u1",
  type: "appointment",
  title: `Notification ${id}`,
  body: "",
  link: null,
  read_at: read ? "2026-09-15T00:00:00Z" : null,
  created_at: "2026-09-15T00:00:00Z",
});

const feed = (items: Notification[], unread: number): NotificationFeed => ({
  items,
  unread,
});

describe("addToFeed", () => {
  it("puts a new notification first and counts it as unread", () => {
    const result = addToFeed(feed([note("a")], 1), note("b"));
    expect(result.items.map((n) => n.id)).toEqual(["b", "a"]);
    expect(result.unread).toBe(2);
  });

  // A refetch that already includes the row can land before the realtime event.
  // Adding it again showed the notification twice and inflated the badge.
  it("ignores a notification that is already in the feed", () => {
    const current = feed([note("a")], 1);
    expect(addToFeed(current, note("a"))).toBe(current);
  });

  it("does not count an already-read notification as unread", () => {
    expect(addToFeed(feed([], 0), note("a", true)).unread).toBe(0);
  });

  it("keeps the feed at its page size", () => {
    const full = feed(
      Array.from({ length: FEED_SIZE }, (_, i) => note(`n${i}`, true)),
      0,
    );
    const result = addToFeed(full, note("new"));
    expect(result.items).toHaveLength(FEED_SIZE);
    expect(result.items[0].id).toBe("new");
  });
});

describe("applyUpdate", () => {
  it("marks a notification read and lowers the count", () => {
    const result = applyUpdate(
      feed([note("a"), note("b")], 2),
      note("a", true),
    );
    expect(result.items[0].read_at).not.toBeNull();
    expect(result.unread).toBe(1);
  });

  it("leaves the count alone when nothing changed", () => {
    const current = feed([note("a", true)], 0);
    expect(applyUpdate(current, note("a", true)).unread).toBe(0);
  });

  it("ignores rows that are not loaded", () => {
    const current = feed([note("a")], 3);
    expect(applyUpdate(current, note("zzz", true))).toBe(current);
  });
});

describe("removeFromFeed", () => {
  it("drops the notification and lowers the count if it was unread", () => {
    const result = removeFromFeed(feed([note("a"), note("b", true)], 1), "a");
    expect(result.items.map((n) => n.id)).toEqual(["b"]);
    expect(result.unread).toBe(0);
  });

  it("never lets the count go below zero", () => {
    expect(removeFromFeed(feed([note("a")], 0), "a").unread).toBe(0);
  });

  it("ignores ids that are not loaded", () => {
    const current = feed([note("a")], 1);
    expect(removeFromFeed(current, "zzz")).toBe(current);
  });
});
