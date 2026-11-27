"use client";

import type { ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { steadyTransitions } from "@/lib/motion";

export interface StepDefinition {
  id: string;
  label: string;
}

export function Stepper({
  steps,
  currentIndex,
  onStepSelect,
  children,
  className,
}: {
  steps: readonly StepDefinition[];
  currentIndex: number;
  onStepSelect?: (index: number) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <nav aria-label="Progress" className="overflow-x-auto pb-1">
        <ol className="flex min-w-max items-center gap-2 sm:gap-3">
          {steps.map((step, idx) => {
            const done = idx < currentIndex;
            const active = idx === currentIndex;
            const canClick = Boolean(onStepSelect) && idx < currentIndex;
            return (
              <li key={step.id} className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={!canClick}
                  onClick={() => canClick && onStepSelect?.(idx)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-[30px] px-3.5 py-2 text-sm font-medium transition-colors",
                    active &&
                      "bg-primary text-primary-foreground shadow-steady-pill",
                    done &&
                      "bg-brand-subtle text-brand-subtle-foreground cursor-pointer hover:opacity-90",
                    !active &&
                      !done &&
                      "bg-card text-muted-foreground border-border border",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-xs font-semibold",
                      active && "text-primary-foreground bg-white/20",
                      done && "bg-primary text-primary-foreground",
                      !active && !done && "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-3" /> : idx + 1}
                  </span>
                  <span className="whitespace-nowrap">{step.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "h-0.5 w-6 rounded-full sm:w-10",
                      done ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={steps[currentIndex]?.id ?? currentIndex}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={steadyTransitions.smooth}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
