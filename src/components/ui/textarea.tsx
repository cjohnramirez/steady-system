"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Global Textarea matching Figma 578:2648:
 * rounded-[20px] surface + custom tucked bottom-right diagonal resizer handle
 * that hides the native browser grip and drags vertically smoothly.
 */
function Textarea({
  className,
  style,
  ref: forwardedRef,
  ...props
}: React.ComponentProps<"textarea">) {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [height, setHeight] = React.useState<number | undefined>(undefined);
  const dragRef = React.useRef<{ startY: number; startHeight: number } | null>(
    null,
  );

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  function handleResizePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (props.disabled) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const currentHeight =
      innerRef.current?.getBoundingClientRect().height ?? 64;
    dragRef.current = { startY: e.clientY, startHeight: currentHeight };
  }

  function handleResizePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const nextHeight = Math.max(
      56,
      Math.min(
        520,
        dragRef.current.startHeight + (e.clientY - dragRef.current.startY),
      ),
    );
    setHeight(nextHeight);
  }

  function handleResizePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  }

  return (
    <div className="relative w-full">
      <textarea
        ref={setRefs}
        data-slot="textarea"
        style={height !== undefined ? { ...style, height } : style}
        className={cn(
          "border-border bg-card shadow-steady-card placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full resize-none rounded-[20px] border px-5 py-4 pr-10 text-[15px] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {/* Custom Figma 578:2651 diagonal resizer grip tucked inside the 20px radius */}
      <div
        aria-hidden
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        className={cn(
          "text-muted-foreground/80 hover:text-foreground absolute right-[13px] bottom-[13px] flex size-[14px] touch-none items-center justify-center transition-colors select-none",
          props.disabled
            ? "pointer-events-none opacity-40"
            : "cursor-ns-resize",
        )}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.5 1.5L1.5 10.5M10.5 6.5L6.5 10.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export { Textarea };
