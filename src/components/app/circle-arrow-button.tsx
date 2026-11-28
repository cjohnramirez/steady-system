import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const baseClasses =
  "bg-card border-border text-foreground shadow-steady-card hover:bg-muted focus-visible:ring-ring/50 inline-flex aspect-square size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-[3px] active:scale-[0.97]";

/**
 * Universal 1:1 Circular Outline Arrow Button (Figma 678:19489).
 * Uses consistent 1.5px stroke weight across the entire system.
 */
export function CircleArrowButton({
  href,
  onClick,
  ariaLabel,
  className,
}: {
  href?: string;
  onClick?: () => void;
  ariaLabel: string;
  className?: string;
}) {
  const icon = (
    <ArrowUpRight aria-hidden strokeWidth={1.5} className="size-5" />
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={cn(baseClasses, className)}
      >
        {icon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(baseClasses, className)}
    >
      {icon}
    </button>
  );
}
