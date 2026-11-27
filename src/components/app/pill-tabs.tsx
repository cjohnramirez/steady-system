"use client";

import { useId } from "react";
import * as m from "motion/react-m";
import { cn } from "@/lib/utils";
import { steadyTransitions } from "@/lib/motion";

export interface PillTabOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

/**
 * Animated segmented pill tabs matching Figma's Admin Audit, CMS, and Login role
 * switchers. Uses a shared `layoutId` spring indicator with GPU-only transforms.
 */
export function PillTabs<T extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: {
  options: readonly PillTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const layoutId = useId();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "bg-card border-border shadow-steady-card inline-flex max-w-full flex-wrap items-center gap-1 rounded-[30px] border p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "focus-visible:ring-ring/50 relative inline-flex cursor-pointer items-center gap-2 rounded-[30px] px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
              active
                ? "text-primary-foreground"
                : "text-foreground hover:text-primary",
            )}
          >
            {active && (
              <m.span
                layoutId={`pill-tab-${layoutId}`}
                transition={steadyTransitions.tabIndicator}
                className="bg-primary shadow-steady-pill absolute inset-0 rounded-[30px]"
              />
            )}
            <span className="relative z-10 whitespace-nowrap">{opt.label}</span>
            {typeof opt.count === "number" && (
              <span
                className={cn(
                  "relative z-10 rounded-full px-2 py-0.5 text-xs",
                  active
                    ? "text-primary-foreground bg-white/20"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
