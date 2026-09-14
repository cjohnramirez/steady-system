import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type Detail = { label: string; value: ReactNode };

/** Label and value pairs in a responsive grid, as a description list. */
export function DetailList({
  items,
  isLoading,
  columns = 2,
  className,
}: {
  items: Detail[];
  isLoading?: boolean;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4",
        columns >= 2 && "sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0 space-y-1 border-b pb-3">
          <dt className="text-muted-foreground text-xs">{item.label}</dt>
          <dd className="break-words">
            {isLoading ? (
              <Skeleton className="h-5 w-3/4" />
            ) : item.value === null ||
              item.value === undefined ||
              item.value === "" ? (
              <span className="text-muted-foreground">Not provided</span>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
