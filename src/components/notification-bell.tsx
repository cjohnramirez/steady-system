"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BellOff,
  CalendarClock,
  Check,
  RefreshCw,
  Siren,
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
import { steadyTransitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "unread" | "requests" | "alerts";

const ICONS = {
  appointment: CalendarClock,
  announcement: RefreshCw,
  system: Siren,
} as const;

const TYPE_TAGS = {
  appointment: "Request",
  announcement: "Update",
  system: "Alert",
} as const;

function useMinuteTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
}

/**
 * Figma Notifications Popover (678:19177):
 * Plain unread dot on bell trigger + rounded-[20px] card with status pill,
 * "Mark all as read" pill button, 4-tab pill filter bar, clean rows with
 * top-right ArrowUpRight, and footer link pill.
 */
export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<FilterTab>("all");
  const device = useDeviceNotifications();
  const { feed, markRead, markAllRead } = useNotifications(userId, {
    onArrive: device.show,
  });
  const unread = feed.data?.unread ?? 0;
  const items = feed.data?.items ?? [];

  const visibleItems = items.filter((n) => {
    if (tab === "unread") return !n.read_at;
    if (tab === "requests") return n.type === "appointment";
    if (tab === "alerts") return n.type === "system";
    return true;
  });

  useMinuteTick();

  const label =
    unread > 0 ? `Notifications, ${unread} unread` : "Notifications";

  const tabs: { value: FilterTab; label: string }[] = [
    { value: "all", label: `All (${items.length})` },
    { value: "unread", label: `Unread (${unread})` },
    { value: "requests", label: "Requests" },
    { value: "alerts", label: "Clinical Alerts" },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={label}
        >
          <Bell strokeWidth={1.5} className="size-[18px]" />
          {unread > 0 && (
            <span
              aria-hidden
              className="bg-primary ring-card absolute top-2.5 right-2.5 size-2.5 rounded-full ring-2"
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        collisionPadding={16}
        className="bg-card border-border shadow-steady-card flex max-h-[min(36rem,calc(var(--radix-popover-content-available-height)-1rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[20px] border p-0 sm:w-[440px]"
      >
        {/* Top Header Band (Figma 678:19178) */}
        <div className="border-border flex shrink-0 flex-col gap-4 border-b p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 text-left">
              <h2 className="text-foreground text-[15px] leading-none font-medium">
                Notifications
              </h2>
              <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-3 py-0.5 text-[13px]">
                {unread === 0 ? "All Caught Up" : `${unread} Unread`}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={unread === 0}
              loading={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
              className="px-4 text-[14px]"
            >
              <span>Mark All as Read</span>
              <Check strokeWidth={1.5} className="size-4" />
            </Button>
          </div>

          {/* 4-Tab Pill Filter Strip */}
          <div
            role="tablist"
            aria-label="Filter notifications"
            className="bg-card border-border shadow-steady-card flex items-center justify-between gap-1 overflow-x-auto rounded-full border p-1"
          >
            {tabs.map((t) => {
              const active = tab === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    "flex-1 cursor-pointer rounded-full px-3 py-2 text-center text-[13px] whitespace-nowrap transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-steady-pill font-medium"
                      : "text-foreground/80 hover:text-foreground font-normal",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Notification Feed */}
        {feed.isLoading ? (
          <div className="space-y-3 p-5" aria-busy>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-[16px]" />
            ))}
          </div>
        ) : feed.isError ? (
          <ErrorState
            title="Notifications Couldn't Be Loaded"
            onRetry={() => feed.refetch()}
            className="m-4 border-none p-6"
          />
        ) : visibleItems.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 p-10 text-center">
            <BellOff aria-hidden strokeWidth={1.5} className="size-8" />
            <p className="text-[14px]">
              {tab === "unread"
                ? "No unread notifications."
                : "You're all caught up."}
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <ul className="divide-border divide-y">
              <AnimatePresence initial={false}>
                {visibleItems.map((item) => (
                  <m.li
                    key={item.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={steadyTransitions.smooth}
                  >
                    <NotificationRow
                      item={item}
                      onOpen={() => {
                        if (!item.read_at) markRead.mutate(item.id);
                        if (item.link) setOpen(false);
                      }}
                    />
                  </m.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}

        {/* Footer Band */}
        <div className="border-border flex shrink-0 items-center justify-end border-t p-4">
          <Button
            asChild
            variant="outline"
            onClick={() => setOpen(false)}
            className="px-5 text-[14px]"
          >
            <Link href="/student/appointments">
              <span>View All Activity</span>
              <ArrowRight strokeWidth={1.5} className="size-4" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: Notification;
  onOpen: () => void;
}) {
  const Icon = ICONS[item.type] ?? Bell;
  const tag = TYPE_TAGS[item.type] ?? "Notice";
  const unread = !item.read_at;

  const content = (
    <>
      <Icon
        aria-hidden
        strokeWidth={1.5}
        className="text-foreground mt-0.5 size-5 shrink-0"
      />
      <div className="min-w-0 flex-1 space-y-1 text-left">
        <p className="text-foreground truncate text-[15px] leading-snug font-medium">
          {unread && <span className="sr-only">Unread: </span>}
          {item.title}
        </p>
        {item.body && (
          <p className="text-foreground/80 line-clamp-2 text-[14px] leading-snug">
            {item.body}
          </p>
        )}
        <div className="flex items-center gap-2.5 pt-1">
          <span className="text-muted-foreground text-[13px]">
            {formatDistanceToNow(new Date(item.created_at), {
              addSuffix: true,
            })}
          </span>
          <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[12px]">
            {tag}
          </span>
        </div>
      </div>
      <ArrowUpRight
        aria-hidden
        strokeWidth={1.5}
        className="text-foreground/70 mt-0.5 size-4 shrink-0"
      />
    </>
  );

  const rowClass = cn(
    "hover:bg-muted/50 flex w-full cursor-pointer items-start gap-3.5 px-5 py-4 transition-colors",
    unread && "bg-brand-subtle/40",
  );

  return item.link ? (
    <Link href={item.link} className={rowClass} onClick={onOpen}>
      {content}
    </Link>
  ) : (
    <button type="button" className={rowClass} onClick={onOpen}>
      {content}
    </button>
  );
}
