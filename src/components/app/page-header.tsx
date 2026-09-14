import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one `<h1>` on a page, with its supporting line.
 *
 * No page had an h1 before; every title was a `<p className="text-4xl">`.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        <h1 className="text-3xl tracking-tight md:text-4xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
