import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const steadyLabelVariants = cva(
  "inline-flex items-center justify-center border text-[14px] font-normal leading-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        default: "bg-card border-border text-foreground shadow-steady-card",
        subtle: "bg-muted/70 border-border text-foreground",
        brand:
          "bg-brand-subtle border-transparent text-brand-subtle-foreground",
        positive: "bg-positive/15 border-positive/30 text-foreground",
        warning: "bg-warning/15 border-warning/30 text-warning",
        destructive: "bg-destructive/15 border-destructive/30 text-destructive",
      },
      size: {
        sm: "gap-2 rounded-[var(--radius-label)] px-3.5 py-2 text-[13px]",
        md: "gap-2.5 rounded-[var(--radius-label)] px-4 py-2.5 text-[14px]",
        lg: "gap-4 rounded-[var(--radius-label)] px-5 py-3.5 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

/**
 * Universal non-interactive Steady Label / Pill (Figma 678:19314).
 * Intentionally has NO hover animation so it remains distinct from interactive tabs/buttons.
 */
export function SteadyLabel({
  icon: Icon,
  variant,
  size,
  progress,
  className,
  children,
}: VariantProps<typeof steadyLabelVariants> & {
  icon?: LucideIcon;
  /** Optional 0–100 progress bar (renders Figma 678:19314 "25% Complete" bar) */
  progress?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn(steadyLabelVariants({ variant, size }), className)}>
      {Icon && (
        <Icon
          aria-hidden
          strokeWidth={1.5}
          className={cn("shrink-0", size === "lg" ? "size-4" : "size-3.5")}
        />
      )}
      <span>{children}</span>
      {typeof progress === "number" && (
        <span className="bg-muted inline-block h-1 w-28 overflow-hidden rounded-full sm:w-36">
          <span
            className="bg-positive block h-full rounded-full transition-[width] duration-300"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </span>
      )}
    </span>
  );
}
