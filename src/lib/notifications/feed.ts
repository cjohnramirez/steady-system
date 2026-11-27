import type { Notification, NotificationFeed } from "./queries";

/** How many notifications the bell loads and keeps. */
export const FEED_SIZE = 20;

/*
 * Pure cache updates for the notification feed, applied as realtime events arrive.
 * Each returns the same object when nothing changes, so React Query skips the
 * re-render.
 */

/** A new notification: first in the list, counted if unread, never twice. */
export function addToFeed(
  feed: NotificationFeed,
  item: Notification,
): NotificationFeed {
  if (feed.items.some((n) => n.id === item.id)) return feed;
  return {
    items: [item, ...feed.items].slice(0, FEED_SIZE),
    unread: feed.unread + (item.read_at ? 0 : 1),
  };
}

/** A changed notification, usually marked read in another tab. */
export function applyUpdate(
  feed: NotificationFeed,
  item: Notification,
): NotificationFeed {
  const current = feed.items.find((n) => n.id === item.id);
  if (!current) return feed;

  const wasUnread = !current.read_at;
  const isUnread = !item.read_at;
  return {
    items: feed.items.map((n) => (n.id === item.id ? item : n)),
    unread: Math.max(0, feed.unread + Number(isUnread) - Number(wasUnread)),
  };
}

/**
 * A deleted notification. Realtime delete events carry only the id, so whether it
 * was unread comes from the loaded copy.
 */
export function removeFromFeed(
  feed: NotificationFeed,
  id: string,
): NotificationFeed {
  const current = feed.items.find((n) => n.id === id);
  if (!current) return feed;
  return {
    items: feed.items.filter((n) => n.id !== id),
    unread: Math.max(0, feed.unread - (current.read_at ? 0 : 1)),
  };
}
