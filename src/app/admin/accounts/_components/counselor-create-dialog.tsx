"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { FormInputField } from "@/components/form-input-field";
import FormPasswordField from "@/components/form-password-field";
import { createClient } from "@/utils/supabase/client";
import {
  createCounselor,
  setCounselorDepartments,
} from "@/lib/counselors/actions";
import { DbError } from "@/lib/db/error";
import { abbreviateProgram } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { PASSWORD_HINT } from "@/lib/validation/fields";
import { counselorCreateSchema } from "@/lib/validation/staff";

async function fetchAllDepartments(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("department")
    .select(
      "id, title, counselor_id, college:college_id(abbreviation, full_name)",
    )
    .order("title");
  if (error) throw new DbError("Could not load departments", error);
  return data;
}

/**
 * Register Guidance Counselor Modal (Figma 687:1078):
 * Creates a counselor account and optionally assigns handled departments in one flow.
 */
export default function CounselorCreateDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const formId = "create-counselor-form";

  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
  const [deptQuery, setDeptQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);

  const departmentsQuery = useQuery({
    queryKey: ["departments", "all-for-register"],
    queryFn: () => fetchAllDepartments(supabase),
    staleTime: 60_000,
  });

  const allDepts = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  );

  const deptById = useMemo(() => {
    const map = new Map<
      string,
      { id: string; title: string; collegeLabel: string }
    >();
    for (const d of allDepts) {
      map.set(d.id, {
        id: d.id,
        title: d.title,
        collegeLabel:
          d.college?.abbreviation ?? d.college?.full_name ?? "College",
      });
    }
    return map;
  }, [allDepts]);

  const matchingDepts = useMemo(() => {
    const available = allDepts.filter(
      (d) => !d.counselor_id && !selectedDeptIds.includes(d.id),
    );
    const q = deptQuery.trim().toLowerCase();
    if (!q) return available;
    return available
      .filter((d) => {
        const abbr = abbreviateProgram(d.title).toLowerCase();
        const col = (
          d.college?.abbreviation ??
          d.college?.full_name ??
          ""
        ).toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          abbr.includes(q) ||
          col.includes(q)
        );
      })
      .sort((a, b) => {
        const aAbbr = abbreviateProgram(a.title).toLowerCase();
        const bAbbr = abbreviateProgram(b.title).toLowerCase();
        const aStarts =
          aAbbr.startsWith(q) || a.title.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts =
          bAbbr.startsWith(q) || b.title.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts;
      });
  }, [allDepts, deptQuery, selectedDeptIds]);

  const safeHighlightedIdx =
    matchingDepts.length > 0
      ? Math.min(highlightedIdx, matchingDepts.length - 1)
      : 0;

  function addDept(id: string) {
    if (!selectedDeptIds.includes(id)) {
      setSelectedDeptIds((prev) => [...prev, id]);
    }
    setDeptQuery("");
    setHighlightedIdx(0);
    setDropdownOpen(false);
  }

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      university_id: 0,
      password: "",
    },
    validators: { onSubmit: counselorCreateSchema },
    onSubmit: async ({ value }) => {
      const result = await createCounselor(value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (selectedDeptIds.length > 0) {
        const { data: created } = await supabase
          .from("counselor_with_details")
          .select("id")
          .eq("email", value.email)
          .maybeSingle();
        if (created?.id) {
          await setCounselorDepartments(created.id, selectedDeptIds);
        }
      }

      toast.success(`${value.first_name}'s counselor account is ready.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.counselors.all }),
        queryClient.invalidateQueries({ queryKey: ["departments"] }),
      ]);
      router.refresh();
      onClose();
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        {/* Static Gray Header Band (Figma 687:1078) */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            Register Guidance Counselor
          </DialogTitle>
          <DialogDescription className="text-foreground/80 mt-1 text-[15px]">
            Create a licensed counselor account and assign academic departments.
          </DialogDescription>
        </div>

        {/* Scrollable White Center Body */}
        <form
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
          className="divide-border min-h-0 flex-1 divide-y overflow-y-auto text-left"
        >
          <div className="p-5">
            <FieldGroup className="gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="first_name">
                  {(f) => (
                    <FormInputField
                      field={f}
                      label="First Name"
                      placeholder="Clara"
                    />
                  )}
                </form.Field>
                <form.Field name="last_name">
                  {(f) => (
                    <FormInputField
                      field={f}
                      label="Last Name"
                      placeholder="Mendoza"
                    />
                  )}
                </form.Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="username">
                  {(f) => (
                    <FormInputField
                      field={f}
                      label="Username"
                      placeholder="clara.mendoza"
                    />
                  )}
                </form.Field>
                <form.Field name="phone">
                  {(f) => (
                    <FormInputField
                      field={f}
                      label="Phone Extension"
                      type="tel"
                      placeholder="+63 (02) 8888-2204"
                      optional
                    />
                  )}
                </form.Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="email">
                  {(f) => (
                    <FormInputField
                      field={f}
                      label="Email Address"
                      type="email"
                      autoComplete="off"
                      placeholder="clara.mendoza@ustp.edu.ph"
                    />
                  )}
                </form.Field>
                <form.Field name="university_id">
                  {(f) => (
                    <FormInputField
                      field={f}
                      label="University ID"
                      type="number"
                    />
                  )}
                </form.Field>
              </div>

              <form.Field name="password">
                {(f) => (
                  <FormPasswordField
                    field={f}
                    label="Temporary Password"
                    autoComplete="new-password"
                    description={PASSWORD_HINT}
                  />
                )}
              </form.Field>
            </FieldGroup>
          </div>

          {/* Manage Handled Departments */}
          <div className="space-y-4 p-5">
            <p className="text-foreground text-[15px] font-medium">
              Manage Handled Departments
            </p>

            <div className="space-y-3">
              {selectedDeptIds.map((id) => {
                const info = deptById.get(id);
                return (
                  <div key={id} className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Remove ${info?.title ?? "department"}`}
                      onClick={() =>
                        setSelectedDeptIds((prev) =>
                          prev.filter((item) => item !== id),
                        )
                      }
                      className="shrink-0"
                    >
                      <Trash2 strokeWidth={1.5} className="size-4" />
                    </Button>
                    <div className="border-border bg-card shadow-steady-card flex h-12 min-w-0 flex-1 items-center rounded-[25px] border px-4 text-[15px]">
                      <span className="truncate">
                        {info?.title ?? "Department"}
                      </span>
                    </div>
                    <div className="border-border bg-card shadow-steady-card flex h-12 shrink-0 items-center rounded-[25px] border px-4 text-[15px]">
                      {info?.collegeLabel ?? "College"}
                    </div>
                  </div>
                );
              })}

              <div className="relative flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={matchingDepts.length === 0}
                  onClick={() => {
                    const top = matchingDepts[safeHighlightedIdx];
                    if (top) addDept(top.id);
                  }}
                  aria-label="Add matched department"
                  className="shrink-0"
                >
                  <Plus strokeWidth={1.5} className="size-4" />
                </Button>

                <div className="relative min-w-0 flex-1">
                  <div className="border-border bg-card shadow-steady-card flex h-12 w-full items-center gap-2.5 rounded-[25px] border px-4">
                    <Search
                      strokeWidth={1.5}
                      className="text-muted-foreground size-4 shrink-0"
                    />
                    <input
                      type="text"
                      role="combobox"
                      aria-controls="register-counselor-dept-suggestions"
                      aria-expanded={dropdownOpen}
                      aria-autocomplete="list"
                      value={deptQuery}
                      onFocus={() => {
                        setDropdownOpen(true);
                        setHighlightedIdx(0);
                      }}
                      onBlur={() => {
                        window.setTimeout(() => setDropdownOpen(false), 150);
                      }}
                      onChange={(e) => {
                        setDeptQuery(e.target.value);
                        setDropdownOpen(true);
                        setHighlightedIdx(0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setDropdownOpen(false);
                        } else if (dropdownOpen && matchingDepts.length > 0) {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setHighlightedIdx(
                              (prev) => (prev + 1) % matchingDepts.length,
                            );
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setHighlightedIdx(
                              (prev) =>
                                (prev - 1 + matchingDepts.length) %
                                matchingDepts.length,
                            );
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                            const picked = matchingDepts[safeHighlightedIdx];
                            if (picked) addDept(picked.id);
                          }
                        }
                      }}
                      placeholder="Type to search departments..."
                      className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-[15px] outline-none"
                    />
                  </div>

                  {dropdownOpen && (
                    <div
                      id="register-counselor-dept-suggestions"
                      role="listbox"
                      className="bg-popover border-border shadow-steady-card absolute bottom-[calc(100%+6px)] left-0 z-30 max-h-[200px] w-full overflow-y-auto rounded-[15px] border p-2.5"
                    >
                      {matchingDepts.length === 0 ? (
                        <p className="text-muted-foreground px-3 py-2 text-left text-[15px]">
                          No matching departments
                        </p>
                      ) : (
                        matchingDepts.map((d, idx) => {
                          const isHighlighted = idx === safeHighlightedIdx;
                          const col =
                            d.college?.abbreviation ??
                            d.college?.full_name ??
                            "College";
                          return (
                            <button
                              key={d.id}
                              type="button"
                              role="option"
                              aria-selected={isHighlighted}
                              onMouseEnter={() => setHighlightedIdx(idx)}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                addDept(d.id);
                              }}
                              className={cn(
                                "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] px-3 py-2.5 text-left text-[15px] transition-colors",
                                isHighlighted
                                  ? "bg-muted text-foreground"
                                  : "text-foreground hover:bg-muted/60",
                              )}
                            >
                              <span className="truncate">{d.title}</span>
                              <span className="text-muted-foreground shrink-0 text-[14px]">
                                {col}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Static Gray Footer Band */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end gap-2.5 border-t p-5">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="positive"
            loading={isSubmitting}
          >
            Register Counselor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
