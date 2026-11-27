"use client";

import { useState, useTransition } from "react";
import { Calendar, Check, ClipboardCheck } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { toast } from "sonner";
import { SectionCard } from "@/components/app/section-card";
import { EmptyState } from "@/components/app/empty-state";
import { toggleActionItem } from "@/lib/actions/clinical";
import { steadyTransitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface ActionPlanItem {
  id: string;
  title: string;
  is_completed: boolean;
  due_date?: string | null;
}

export function ActionPlanCard({
  initialItems,
  previewOnly = false,
  className,
}: {
  initialItems: ActionPlanItem[];
  previewOnly?: boolean;
  className?: string;
}) {
  const [items, setItems] = useState<ActionPlanItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  const completedCount = items.filter((item) => item.is_completed).length;
  const totalCount = items.length;
  const pct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  function handleToggle(item: ActionPlanItem) {
    const nextCompleted = !item.is_completed;
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, is_completed: nextCompleted } : row,
      ),
    );

    if (previewOnly) return;

    startTransition(async () => {
      const res = await toggleActionItem({
        id: item.id,
        is_completed: nextCompleted,
      });
      if (!res.ok) {
        setItems((prev) =>
          prev.map((row) =>
            row.id === item.id
              ? { ...row, is_completed: item.is_completed }
              : row,
          ),
        );
        toast.error(res.error);
      }
    });
  }

  return (
    <SectionCard
      title="Post-Session Action Plan"
      description="Small, practical steps you and your counselor agreed on."
      className={className}
      actions={
        totalCount > 0 ? (
          <span className="bg-brand-subtle text-brand-subtle-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
            {completedCount} / {totalCount} done
          </span>
        ) : undefined
      }
    >
      {totalCount === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No action steps yet"
          description="After a counseling session, your counselor can share gentle follow-up steps here."
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <m.div
              className="bg-positive h-full rounded-full"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={steadyTransitions.smooth}
            />
          </div>

          <ul className="space-y-2.5" aria-busy={isPending}>
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <m.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={steadyTransitions.smooth}
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    aria-pressed={item.is_completed}
                    className={cn(
                      "border-border hover:bg-muted/60 focus-visible:ring-ring/50 flex w-full items-start gap-3 rounded-[16px] border p-3.5 text-left transition-colors outline-none focus-visible:ring-[3px]",
                      item.is_completed && "bg-muted/40",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        item.is_completed
                          ? "border-positive bg-positive text-positive-foreground"
                          : "border-input bg-card",
                      )}
                    >
                      {item.is_completed && <Check className="size-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <span
                        className={cn(
                          "block text-sm font-medium transition-colors",
                          item.is_completed &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {item.title}
                      </span>
                      {item.due_date && (
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                          <Calendar className="size-3" />
                          Target: {item.due_date}
                        </span>
                      )}
                    </span>
                  </button>
                </m.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </SectionCard>
  );
}
