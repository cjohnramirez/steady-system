"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, BellOff, CalendarClock, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification } from "@/lib/notifications/queries";
import { cn } from "@/lib/utils";

const ICONS = {
  appointment: CalendarClock,
  announcement: Megaphone,
  system: Bell,
} as const;

export function NotificationBell({ userId }: { userId: string }) {
  const { feed, markRead, markAllRead, remove } = useNotifications(userId);
  const unread = feed.data?.unread ?? 0;
  const items = feed.data?.items ?? [];

  const label =
    unread > 0 ? `Notifications, ${unread} unread` : "Notifications";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={label}
        >
          <Bell />
          {unread > 0 && (
            <span
              aria-hidden
              className="bg-primary text-primary-foreground ring-card absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium ring-2"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        // overflow-hidden clips the tinted unread rows to the rounded corners.
        // The popover is capped at the space left below the bell, and only the
        // list scrolls, so the header stays put and nothing is cut off.
        className="flex max-h-[min(32rem,calc(var(--radix-popover-content-available-height)-1rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl p-0"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="font-medium">Notifications</h2>
          {unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {feed.isLoading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : feed.isError ? (
          <p className="text-muted-foreground p-6 text-center">
            Notifications could not be loaded.
          </p>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 p-8 text-center">
            <BellOff aria-hidden strokeWidth={1.25} className="size-8" />
            <p>You&apos;re all caught up.</p>
          </div>
        ) : (
          // A native scroller: max-h on a Radix ScrollArea root never limited its
          // viewport, so long lists overflowed the popover instead of scrolling.
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
            <ul className="divide-y">
              {items.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onOpen={() => !item.read_at && markRead.mutate(item.id)}
                  onRemove={() => remove.mutate(item.id)}
                />
              ))}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  item,
  onOpen,
  onRemove,
}: {
  item: Notification;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const Icon = ICONS[item.type] ?? Bell;
  const unread = !item.read_at;

  const body = (
    <>
      <Icon
        aria-hidden
        strokeWidth={1.5}
        className="text-muted-foreground mt-0.5 size-4 shrink-0"
      />
      <div className="min-w-0 flex-1 space-y-0.5 text-left">
        <p className={cn("truncate", unread && "font-medium")}>
          {unread && <span className="sr-only">Unread: </span>}
          {item.title}
        </p>
        {item.body && (
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {item.body}
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </p>
      </div>
      {unread && (
        <span
          aria-hidden
          className="bg-primary mt-1.5 size-2 shrink-0 rounded-full"
        />
      )}
    </>
  );

  const rowClass = cn(
    "hover:bg-muted flex w-full gap-3 px-4 py-3 pr-10 transition-colors",
    unread && "bg-brand-subtle",
  );

  return (
    <li className="group relative">
      {item.link ? (
        <Link href={item.link} className={rowClass} onClick={onOpen}>
          {body}
        </Link>
      ) : (
        <button type="button" className={rowClass} onClick={onOpen}>
          {body}
        </button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove notification: ${item.title}`}
        className="absolute top-2 right-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        onClick={onRemove}
      >
        <X />
      </Button>
    </li>
  );
}
