"use client";

import { useState, useTransition } from "react";
import { Calendar, Check, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/empty-state";
import { SteadyLabel } from "@/components/app/steady-label";
import { toggleActionItem } from "@/lib/actions/clinical";
import { cn } from "@/lib/utils";

export interface ActionPlanItem {
  id: string;
  title: string;
  is_completed: boolean;
  due_date?: string | null;
}

/**
 * Figma 678:19319 Post-Session Action Plan card:
 * Top header with SteadyLabel progress pill + 2x2 interactive checklist grid.
 */
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
    <section
      className={cn(
        "bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-foreground text-[18px] font-medium">
            Post-Session Action Plan
          </h2>
          <p className="text-muted-foreground text-[15px]">
            Small, practical steps you and your counselor agreed on.
          </p>
        </div>

        {totalCount > 0 && (
          <SteadyLabel size="md" progress={pct}>
            {pct}% Complete
          </SteadyLabel>
        )}
      </div>

      {totalCount === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No Action Steps Yet"
          description="After a counseling session, your counselor can share gentle follow-up steps here."
        />
      ) : (
        <ul
          className="grid gap-3 sm:grid-cols-2"
          aria-busy={isPending}
          aria-label="Action plan tasks"
        >
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleToggle(item)}
                aria-pressed={item.is_completed}
                className={cn(
                  "border-border bg-card hover:bg-muted/50 focus-visible:ring-ring/50 shadow-steady-card flex h-full w-full cursor-pointer items-start gap-3.5 rounded-[16px] border p-4 text-left transition-colors outline-none focus-visible:ring-[3px]",
                  item.is_completed && "bg-muted/40",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors",
                    item.is_completed
                      ? "border-positive bg-positive text-positive-foreground"
                      : "border-input bg-card",
                  )}
                >
                  {item.is_completed && (
                    <Check strokeWidth={2} className="size-3.5" />
                  )}
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                  <span
                    className={cn(
                      "block text-[15px] leading-snug font-normal transition-colors",
                      item.is_completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {item.title}
                  </span>
                  {item.due_date && (
                    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[13px]">
                      <Calendar strokeWidth={1.5} className="size-3.5" />
                      Target: {item.due_date}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
