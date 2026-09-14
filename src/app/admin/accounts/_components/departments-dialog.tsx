"use client";

import { useMemo, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { setCounselorDepartments } from "@/lib/counselors/actions";
import { DbError } from "@/lib/db/error";
import { queryKeys } from "@/lib/query-keys";

async function fetchAllDepartments(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("department")
    .select(
      "id, title, counselor_id, college:college_id(abbreviation), counselor:counselor_id(first_name, last_name)",
    )
    .order("title");
  if (error) throw new DbError("Could not load departments", error);
  return data;
}

/**
 * Pick exactly which departments a counselor covers, across every college.
 *
 * The old modal could only add departments one dropdown pair at a time, could not
 * remove any, and kept offering departments already taken by someone else.
 */
export default function DepartmentsDialog({
  counselor,
  onClose,
}: {
  counselor: Tables<"counselor_with_details">;
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(counselor.department_ids ?? []),
  );
  const [isPending, startTransition] = useTransition();

  const departments = useQuery({
    queryKey: [...queryKeys.counselors.departments(counselor.id!), "all"],
    queryFn: () => fetchAllDepartments(supabase),
  });

  const all = departments.data;
  const groups = useMemo(() => {
    const map = new Map<string, NonNullable<typeof all>>();
    for (const d of all ?? []) {
      const key = d.college?.abbreviation ?? "Other";
      map.set(key, [...(map.get(key) ?? []), d]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [all]);

  const toggle = (id: string, on: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const save = () =>
    startTransition(async () => {
      const result = await setCounselorDepartments(counselor.id!, [
        ...selected,
      ]);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Departments updated.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.counselors.all }),
        queryClient.invalidateQueries({ queryKey: ["departments"] }),
      ]);
      onClose();
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Departments for {counselor.first_name}</DialogTitle>
          <DialogDescription>
            Students in the checked departments book with this counselor.
            Checking a department another counselor covers moves it here.
          </DialogDescription>
        </DialogHeader>
        {departments.isLoading ? (
          <Skeleton className="h-80 rounded-xl" />
        ) : (
          <ScrollArea className="min-h-0 flex-1 rounded-xl border">
            <div className="space-y-5 p-4">
              {groups.map(([college, list]) => (
                <fieldset key={college} className="space-y-2">
                  <legend className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                    {college}
                  </legend>
                  {list.map((d) => {
                    const id = `dept-${d.id}`;
                    const owner =
                      d.counselor_id &&
                      d.counselor_id !== counselor.id &&
                      d.counselor
                        ? `${d.counselor.first_name} ${d.counselor.last_name}`
                        : null;
                    return (
                      <div key={d.id} className="flex items-start gap-3">
                        <Checkbox
                          id={id}
                          checked={selected.has(d.id)}
                          onCheckedChange={(checked) =>
                            toggle(d.id, checked === true)
                          }
                        />
                        <label htmlFor={id} className="leading-snug">
                          {d.title}
                          {owner && (
                            <span className="text-muted-foreground block text-xs">
                              Currently {owner}
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </fieldset>
              ))}
            </div>
          </ScrollArea>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isPending || departments.isLoading}>
            {isPending && <Spinner />}
            Save departments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
