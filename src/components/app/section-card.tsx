import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The standard surface: white, bordered, flat, rounded-2xl.
 *
 * About forty hand-rolled `rounded-2xl border border-gray-200 bg-white p-8` blocks
 * are replaced by this. Pass `title` for the usual heading plus muted description
 * row, and `actions` for buttons aligned to the right of it.
 */
export function SectionCard({
  title,
  description,
  actions,
  headingLevel = "h2",
  className,
  children,
  ...props
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  headingLevel?: "h2" | "h3";
  className?: string;
  children?: ReactNode;
} & Omit<React.ComponentProps<"section">, "title">) {
  const Heading = headingLevel;

  return (
    <section
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border p-5 md:p-8",
        className,
      )}
      {...props}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            {title && <Heading className="font-medium">{title}</Heading>}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
