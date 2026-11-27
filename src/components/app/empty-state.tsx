import type { ReactNode } from "react";
import { CircleOff, type LucideIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

/** Nothing to show yet. Replaces eight copies of the CircleOff-in-a-box pattern. */
export function EmptyState({
  title,
  description,
  icon = CircleOff,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = icon;

  return (
    <Empty className={cn("rounded-2xl border border-dashed", className)}>
      <EmptyHeader>
        {/* A plain icon, no grey tile, matching the bell's "all caught up" state. */}
        <EmptyMedia
          variant="icon"
          className="text-muted-foreground bg-transparent"
        >
          <Icon strokeWidth={1.25} className="size-8" />
        </EmptyMedia>
        <EmptyTitle className="text-base">{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
