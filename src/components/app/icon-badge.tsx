import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The bordered circle around a thin icon, used beside card titles and on link
 * tiles. Decorative, so it is hidden from assistive technology; the text next to it
 * carries the meaning.
 */
export function IconBadge({
  icon: Icon,
  size = "md",
  className,
}: {
  icon: LucideIcon;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-card inline-flex shrink-0 items-center justify-center rounded-full border",
        size === "md" ? "size-10" : "size-8",
        className,
      )}
    >
      <Icon
        className={size === "md" ? "size-5" : "size-4"}
        strokeWidth={1.25}
      />
    </span>
  );
}
