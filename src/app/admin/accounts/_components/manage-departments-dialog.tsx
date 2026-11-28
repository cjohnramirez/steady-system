"use client";

import { useMemo, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { abbreviateProgram } from "@/lib/format";
import { fetchColleges, fetchDepartments } from "@/lib/reference/queries";
import { queryKeys } from "@/lib/query-keys";

function splitDepartmentTitle(raw: string): { name: string; abbr: string } {
  const match = raw.trim().match(/^(.*?)\s*\(([A-Za-z0-9-]{2,12})\)\s*$/);
  if (match) {
    return { name: match[1].trim(), abbr: match[2].toUpperCase() };
  }
  return { name: raw.trim(), abbr: abbreviateProgram(raw) };
}

/**
 * Manage Colleges & Departments Modal (Figma 687:1172):
 * Supports inline editing of department names and abbreviations, deletion, and adding new units.
 */
export default function ManageDepartmentsDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [newDeptTitle, setNewDeptTitle] = useState("");
  const [newDeptAbbr, setNewDeptAbbr] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAbbr, setEditAbbr] = useState("");
  const [isPending, startTransition] = useTransition();

  const colleges = useQuery({
    queryKey: queryKeys.colleges,
    queryFn: () => fetchColleges(supabase),
    staleTime: 60_000,
  });

  const effectiveCollegeId = selectedCollegeId || colleges.data?.[0]?.id || "";

  const departments = useQuery({
    queryKey: queryKeys.departments(effectiveCollegeId),
    queryFn: () => fetchDepartments(supabase, effectiveCollegeId),
    enabled: Boolean(effectiveCollegeId),
  });

  async function refreshDepts() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.departments(effectiveCollegeId),
      }),
      queryClient.invalidateQueries({ queryKey: queryKeys.counselors.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all }),
    ]);
  }

  function handleAddDepartment() {
    const title = newDeptTitle.trim();
    if (!title || !effectiveCollegeId) {
      toast.error("Please enter a department name.");
      return;
    }
    const fullTitle = newDeptAbbr.trim()
      ? `${title} (${newDeptAbbr.trim().toUpperCase()})`
      : title;

    startTransition(async () => {
      const { error } = await supabase.from("department").insert({
        college_id: effectiveCollegeId,
        title: fullTitle,
      });
      if (error) {
        toast.error(error.message || "Could not add department.");
        return;
      }
      setNewDeptTitle("");
      setNewDeptAbbr("");
      toast.success("Department added.");
      await refreshDepts();
    });
  }

  function startEdit(deptId: string, rawTitle: string) {
    const { name, abbr } = splitDepartmentTitle(rawTitle);
    setEditingId(deptId);
    setEditTitle(name);
    setEditAbbr(abbr);
  }

  function handleSaveEdit(deptId: string) {
    const title = editTitle.trim();
    if (!title) {
      toast.error("Department name cannot be empty.");
      return;
    }
    const fullTitle = editAbbr.trim()
      ? `${title} (${editAbbr.trim().toUpperCase()})`
      : title;

    startTransition(async () => {
      const { error } = await supabase
        .from("department")
        .update({ title: fullTitle })
        .eq("id", deptId);
      if (error) {
        toast.error(error.message || "Could not update department.");
        return;
      }
      setEditingId(null);
      toast.success("Department updated.");
      await refreshDepts();
    });
  }

  function handleDeleteDepartment(deptId: string, title: string) {
    startTransition(async () => {
      const { error } = await supabase
        .from("department")
        .delete()
        .eq("id", deptId);
      if (error) {
        toast.error(
          `Could not delete "${title}" (it may still have assigned students or records).`,
        );
        return;
      }
      toast.success(`Removed "${title}".`);
      await refreshDepts();
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[588px]">
        {/* Static Gray Header Band */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            Manage Colleges &amp; Departments
          </DialogTitle>
          <DialogDescription className="text-foreground/80 mt-1 text-[15px]">
            Add or update academic units and abbreviations linked to counselor
            assignments.
          </DialogDescription>
        </div>

        {/* Scrollable White Center Body */}
        <div className="divide-border min-h-0 flex-1 divide-y overflow-y-auto text-left">
          {/* Select College */}
          <div className="space-y-2.5 p-5">
            <Label htmlFor="manage-college" className="text-[15px] font-medium">
              Select College
            </Label>
            {colleges.isLoading ? (
              <Skeleton className="h-12 w-full rounded-[25px]" />
            ) : (
              <Select
                value={effectiveCollegeId}
                onValueChange={(v) => {
                  setSelectedCollegeId(v);
                  setEditingId(null);
                }}
              >
                <SelectTrigger id="manage-college" className="w-full">
                  <SelectValue placeholder="Choose a college" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Academic Colleges</SelectLabel>
                    {(colleges.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.full_name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Manage Departments */}
          <div className="space-y-4 p-5">
            <p className="text-foreground text-[15px] font-medium">
              Manage Departments
            </p>

            {departments.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-[25px]" />
                <Skeleton className="h-12 w-full rounded-[25px]" />
              </div>
            ) : (
              <div className="space-y-3">
                {(departments.data ?? []).map((dept) => {
                  const isRowEditing = editingId === dept.id;
                  const parsed = splitDepartmentTitle(dept.title);

                  if (isRowEditing) {
                    return (
                      <div key={dept.id} className="flex items-center gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Department name"
                          className="min-w-0 flex-1 rounded-[25px]"
                        />
                        <Input
                          value={editAbbr}
                          onChange={(e) => setEditAbbr(e.target.value)}
                          placeholder="Abbr"
                          className="w-[104px] shrink-0 rounded-[25px]"
                        />
                        <Button
                          type="button"
                          variant="positive"
                          size="icon"
                          disabled={isPending}
                          aria-label="Save department"
                          onClick={() => handleSaveEdit(dept.id)}
                          className="shrink-0"
                        >
                          <Check strokeWidth={1.5} className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={isPending}
                          aria-label="Cancel edit"
                          onClick={() => setEditingId(null)}
                          className="shrink-0"
                        >
                          <X strokeWidth={1.5} className="size-4" />
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div key={dept.id} className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isPending}
                        aria-label={`Remove ${dept.title}`}
                        onClick={() =>
                          handleDeleteDepartment(dept.id, dept.title)
                        }
                        className="shrink-0"
                      >
                        <Trash2 strokeWidth={1.5} className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isPending}
                        aria-label={`Edit ${dept.title}`}
                        onClick={() => startEdit(dept.id, dept.title)}
                        className="shrink-0"
                      >
                        <Pencil strokeWidth={1.5} className="size-4" />
                      </Button>
                      <div className="border-border bg-card shadow-steady-card flex h-12 min-w-0 flex-1 items-center rounded-[25px] border px-4 text-[15px]">
                        <span className="truncate">{parsed.name}</span>
                      </div>
                      <div className="border-border bg-card shadow-steady-card text-foreground flex h-12 shrink-0 items-center rounded-[25px] border px-4 text-[15px]">
                        {parsed.abbr}
                      </div>
                    </div>
                  );
                })}

                {/* Add New Department Row */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isPending || !newDeptTitle.trim()}
                    onClick={handleAddDepartment}
                    aria-label="Add department"
                    className="shrink-0"
                  >
                    <Plus strokeWidth={1.5} className="size-4" />
                  </Button>
                  <Input
                    value={newDeptTitle}
                    onChange={(e) => setNewDeptTitle(e.target.value)}
                    placeholder="Enter Department"
                    className="min-w-0 flex-1 rounded-[25px]"
                  />
                  <Input
                    value={newDeptAbbr}
                    onChange={(e) => setNewDeptAbbr(e.target.value)}
                    placeholder="Abbreviation"
                    className="w-[130px] shrink-0 rounded-[25px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Static Gray Footer Band */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end gap-2.5 border-t p-5">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            loading={isPending}
            onClick={newDeptTitle.trim() ? handleAddDepartment : onClose}
          >
            Update Departments
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
