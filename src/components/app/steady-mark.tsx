import { MARK_SHAPES } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The Lean mark, drawn with the brand tokens so it follows the theme. Decorative:
 * the product name always sits beside it.
 */
export function SteadyMark({ className }: { className?: string }) {
  const { back, front } = MARK_SHAPES;
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden
      className={cn("size-9 shrink-0", className)}
    >
      <rect
        x={back.x}
        y={back.y}
        width={back.width}
        height={back.height}
        rx={back.rx}
        transform={back.rotate}
        className="fill-brand-light"
      />
      <rect
        x={front.x}
        y={front.y}
        width={front.width}
        height={front.height}
        rx={front.rx}
        className="fill-brand"
      />
    </svg>
  );
}
