"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma ReasonTile (551:770): selectable consultation topic card with
 * Default (1px border) and Selected (3px brand-blue border) states.
 */
export function ReasonTile({
  icon: Icon,
  title,
  description,
  selected = false,
  onClick,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "bg-card shadow-steady-card focus-visible:ring-ring/50 flex min-h-[153px] w-full cursor-pointer flex-col items-start gap-5 overflow-hidden rounded-[19px] p-5 text-left transition-[border-color,box-shadow,transform] outline-none focus-visible:ring-[3px] active:scale-[0.99]",
        selected
          ? "border-primary ring-primary/80 border-2 ring-2"
          : "border-border hover:border-foreground/30 border",
        className,
      )}
    >
      <Icon
        aria-hidden
        strokeWidth={1.5}
        className={cn(
          "size-5 shrink-0 transition-colors",
          selected ? "text-primary" : "text-foreground/80",
        )}
      />
      <div className="space-y-1 text-[15px] leading-snug">
        <p className="text-foreground font-medium">{title}</p>
        <p className="text-muted-foreground font-normal">{description}</p>
      </div>
    </button>
  );
}
