"use client";

import { useState, useTransition } from "react";
import {
  Calendar,
  Check,
  GraduationCap,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/app/user-avatar";
import { PillTabs } from "@/components/app/pill-tabs";
import { StatusBadge } from "@/components/app/status-badge";
import {
  createActionItem,
  deleteActionItem,
  toggleActionItem,
} from "@/lib/actions/clinical";
import type { ActionPlanItem } from "@/components/student/action-plan-card";
import { cn } from "@/lib/utils";

export interface StudentDossierRecord {
  id: string;
  name: string;
  email?: string | null;
  universityId?: string | number | null;
  department?: string | null;
  yearLevel?: number | null;
  emotionalStatus?: string | null;
  actionItems?: ActionPlanItem[];
  recentSessions?: {
    id: string;
    dateLabel: string;
    status: string;
    reason?: string | null;
  }[];
}

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "plan", label: "Action Plan" },
  { value: "sessions", label: "Sessions" },
] as const;

export function DossierDialog({
  open,
  onOpenChange,
  student,
  previewOnly = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentDossierRecord | null;
  previewOnly?: boolean;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("overview");
  const [items, setItems] = useState<ActionPlanItem[]>(
    student?.actionItems ?? [],
  );
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!student) return null;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || !student) return;

    if (previewOnly) {
      setItems((prev) => [
        {
          id: `preview-${Date.now()}`,
          title,
          is_completed: false,
          due_date: newDue || null,
        },
        ...prev,
      ]);
      setNewTitle("");
      setNewDue("");
      toast.success("Action step added (preview)");
      return;
    }

    startTransition(async () => {
      const res = await createActionItem({
        student_id: student.id,
        title,
        due_date: newDue || undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setItems((prev) => [res.data, ...prev]);
      setNewTitle("");
      setNewDue("");
      toast.success("Action step shared with student");
    });
  }

  function handleToggle(item: ActionPlanItem) {
    const next = !item.is_completed;
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, is_completed: next } : row,
      ),
    );
    if (previewOnly) return;

    startTransition(async () => {
      const res = await toggleActionItem({ id: item.id, is_completed: next });
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

  function handleDelete(id: string) {
    const previous = items;
    setItems((prev) => prev.filter((row) => row.id !== id));
    if (previewOnly) return;

    startTransition(async () => {
      const res = await deleteActionItem(id);
      if (!res.ok) {
        setItems(previous);
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3.5 text-left">
            <UserAvatar
              name={student.name}
              className="size-12 shrink-0 rounded-[14px]"
            />
            <div className="min-w-0 flex-1">
              <DialogTitle className="privacy-sensitive truncate">
                {student.name}
              </DialogTitle>
              <DialogDescription className="privacy-sensitive truncate">
                {student.universityId ?? "ID —"} •{" "}
                {student.department ?? "Department"} • Year{" "}
                {student.yearLevel ?? "—"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <PillTabs
          ariaLabel="Student dossier sections"
          options={TABS}
          value={tab}
          onChange={setTab}
        />

        {tab === "overview" && (
          <div className="space-y-4 pt-1">
            <div className="bg-muted/60 border-border grid gap-3 rounded-[16px] border p-4 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="text-primary size-4 shrink-0" />
                <span className="privacy-sensitive truncate">
                  {student.email ?? "No email recorded"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="text-primary size-4 shrink-0" />
                <span>
                  {student.department ?? "Unassigned"} (Year{" "}
                  {student.yearLevel ?? "—"})
                </span>
              </div>
            </div>

            {student.emotionalStatus && (
              <div className="bg-brand-subtle/60 border-border flex items-center justify-between rounded-[16px] border px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                  Latest Mood Check-in
                </span>
                <span className="bg-brand-subtle text-brand-subtle-foreground rounded-full px-3 py-0.5 text-xs font-medium">
                  {student.emotionalStatus}
                </span>
              </div>
            )}
          </div>
        )}

        {tab === "plan" && (
          <div className="space-y-4 pt-1">
            <form
              onSubmit={handleAdd}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Assign a gentle follow-up step..."
                className="flex-1"
              />
              <Input
                type="date"
                aria-label="Target due date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                className="sm:w-40"
              />
              <Button type="submit" disabled={isPending || !newTitle.trim()}>
                <Plus className="size-4" />
                Add
              </Button>
            </form>

            {items.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No action plan steps assigned yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="border-border flex items-center gap-3 rounded-[14px] border p-3"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      aria-label={`Mark "${item.title}" ${item.is_completed ? "incomplete" : "complete"}`}
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        item.is_completed
                          ? "border-positive bg-positive text-positive-foreground"
                          : "border-input bg-card",
                      )}
                    >
                      {item.is_completed && <Check className="size-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          item.is_completed &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {item.title}
                      </p>
                      {item.due_date && (
                        <p className="text-muted-foreground text-xs">
                          Due {item.due_date}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove action step"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "sessions" && (
          <div className="space-y-2.5 pt-1">
            {!student.recentSessions || student.recentSessions.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No recent counseling sessions recorded yet.
              </p>
            ) : (
              student.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="border-border flex items-center justify-between gap-3 rounded-[14px] border p-3.5"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="flex items-center gap-1.5 text-sm font-medium">
                      <Calendar className="text-primary size-3.5" />
                      {session.dateLabel}
                    </p>
                    {session.reason && (
                      <p className="text-muted-foreground privacy-sensitive truncate text-xs">
                        {session.reason}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={session.status} />
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
