"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BellOff,
  BellRing,
  CalendarClock,
  Megaphone,
  Smartphone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/app/error-state";
import { useDeviceNotifications } from "@/hooks/use-device-notifications";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification } from "@/lib/notifications/queries";
import { cn } from "@/lib/utils";

const ICONS = {
  appointment: CalendarClock,
  announcement: Megaphone,
  system: Bell,
} as const;

/** Re-renders every minute so "2 minutes ago" doesn't freeze while the page is open. */
function useMinuteTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
}

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const device = useDeviceNotifications();
  const { feed, markRead, markAllRead, remove } = useNotifications(userId, {
    // In a background tab, a system notification replaces the toast.
    onArrive: device.show,
  });
  const unread = feed.data?.unread ?? 0;
  const items = feed.data?.items ?? [];
  useMinuteTick();

  const label =
    unread > 0 ? `Notifications, ${unread} unread` : "Notifications";

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              loading={markAllRead.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {feed.isLoading ? (
          <div className="space-y-3 p-4" aria-busy>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : feed.isError ? (
          <ErrorState
            title="Notifications couldn't be loaded"
            onRetry={() => feed.refetch()}
            className="m-4 border-none p-6"
          />
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
                  removing={remove.isPending && remove.variables === item.id}
                  onOpen={() => {
                    if (!item.read_at) markRead.mutate(item.id);
                    // Opening a notification moves on; the popover used to stay
                    // open on top of the page it had just navigated to.
                    if (item.link) setOpen(false);
                  }}
                  onRemove={() => remove.mutate(item.id)}
                />
              ))}
            </ul>
          </div>
        )}

        <DeviceNotificationsRow device={device} />
      </PopoverContent>
    </Popover>
  );
}

/** Offers device notifications, or explains why they aren't available. */
function DeviceNotificationsRow({
  device,
}: {
  device: ReturnType<typeof useDeviceNotifications>;
}) {
  const row =
    "text-muted-foreground flex shrink-0 items-center gap-3 border-t px-4 py-3 text-xs";

  if (device.permission === "default") {
    return (
      <div className={row}>
        <BellRing aria-hidden strokeWidth={1.5} className="size-4 shrink-0" />
        <p className="min-w-0 flex-1">
          Get device notifications while Steady is open.
        </p>
        <Button
          variant="outline"
          size="sm"
          loading={device.requesting}
          onClick={() => void device.enable()}
        >
          Turn on
        </Button>
      </div>
    );
  }
  if (device.permission === "denied") {
    return (
      <p className={row}>
        <BellOff aria-hidden strokeWidth={1.5} className="size-4 shrink-0" />
        Device notifications are blocked. Allow them in your browser&apos;s site
        settings.
      </p>
    );
  }
  if (device.permission === "granted") {
    return (
      <p className={row}>
        <BellRing aria-hidden strokeWidth={1.5} className="size-4 shrink-0" />
        Device notifications are on while Steady is open.
      </p>
    );
  }
  if (device.needsHomeScreen) {
    return (
      <p className={row}>
        <Smartphone aria-hidden strokeWidth={1.5} className="size-4 shrink-0" />
        On iPhone or iPad, add Steady to your Home Screen (Share, then Add to
        Home Screen) to get notifications.
      </p>
    );
  }
  return null;
}

function NotificationRow({
  item,
  removing,
  onOpen,
  onRemove,
}: {
  item: Notification;
  removing: boolean;
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
    <li className={cn("group relative", removing && "opacity-60")}>
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
        loading={removing}
        // Hover-only hid the button from touch screens entirely; there it stays
        // visible, and anywhere it shows while the row has keyboard focus.
        className="absolute top-2 right-1 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 data-[loading]:opacity-100 [@media(pointer:coarse)]:opacity-100"
        onClick={onRemove}
      >
        <X />
      </Button>
    </li>
  );
}
