import { cn } from "@/lib/utils";

/**
 * CodeBridge, the team that built Steady: two towers rising through a bridge arch.
 * Redrawn from the old PNG as strokes in currentColor, so it follows the text
 * colour in both themes (the PNG was black and vanished on a dark card).
 */
export function CodeBridgeLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="56 8 518 340"
      role="img"
      aria-label="CodeBridge"
      className={cn("h-auto w-24", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="11"
      strokeLinejoin="miter"
    >
      <path d="M68 272 A348 348 0 0 1 556 272" />
      <path d="M197 278 V72 L270 38 V338" />
      <path d="M355 262 V52 L428 18 V322" />
    </svg>
  );
}
