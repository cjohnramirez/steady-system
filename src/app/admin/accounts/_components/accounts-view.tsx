"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Building2, Download, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ErrorState } from "@/components/app/error-state";
import { PageHeader } from "@/components/app/page-header";
import { PillTabs } from "@/components/app/pill-tabs";
import { UserAvatar } from "@/components/app/user-avatar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { fetchCounselors } from "@/lib/counselors/queries";
import { fetchStudents } from "@/lib/students/queries";
import { queryKeys } from "@/lib/query-keys";
import StudentEditDialog from "./student-edit-dialog";
import CounselorEditDialog from "./counselor-edit-dialog";
import CounselorCreateDialog from "./counselor-create-dialog";
import ManageDepartmentsDialog from "./manage-departments-dialog";
import ExportDialog, { type AccountType } from "./export-dialog";

type Student = Tables<"student_with_details">;
type Counselor = Tables<"counselor_with_details">;

type Open =
  | { kind: "student"; row: Student }
  | { kind: "counselor"; row: Counselor }
  | { kind: "manage-departments" }
  | { kind: "create" }
  | { kind: "export" }
  | null;

const PAGE_SIZE = 7;

function formatOrdinalYear(year?: number | null): string {
  if (!year) return "";
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  return `${year}${suffixes[year] ?? "th"} Year`;
}

/**
 * Accounts & Directory Management (Figma 678:20767):
 * Student Directory and Guidance Counselors tabs with college filtering,
 * View Actions dropdown, and full edit/create/export dialogs.
 */
export default function AccountsView() {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<AccountType>("students");
  const [open, setOpen] = useState<Open>(null);
  const [search, setSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const params = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    sort: { id: "last_name", desc: false },
  };

  const students = useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: () => fetchStudents(supabase, params),
    placeholderData: keepPreviousData,
  });

  const counselors = useQuery({
    queryKey: queryKeys.counselors.list(params),
    queryFn: () => fetchCounselors(supabase, params),
    placeholderData: keepPreviousData,
  });

  const studentRows = useMemo(() => {
    const raw = students.data?.data ?? [];
    if (collegeFilter === "all") return raw;
    return raw.filter(
      (s) => s.college_name === collegeFilter || s.department === collegeFilter,
    );
  }, [collegeFilter, students.data?.data]);

  const counselorRows = useMemo(() => {
    const raw = counselors.data?.data ?? [];
    if (collegeFilter === "all") return raw;
    return raw.filter((c) =>
      (c.department ?? "").toLowerCase().includes(collegeFilter.toLowerCase()),
    );
  }, [collegeFilter, counselors.data?.data]);

  const colleges = useMemo(() => {
    const set = new Set<string>();
    for (const s of students.data?.data ?? []) {
      if (s.college_name) set.add(s.college_name);
      else if (s.department) set.add(s.department);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [students.data?.data]);

  const activeQuery = tab === "students" ? students : counselors;
  const studentTotal = students.data?.count ?? 0;
  const counselorTotal = counselors.data?.count ?? 0;
  const activeTotal = tab === "students" ? studentTotal : counselorTotal;
  const activePageCount = Math.max(1, Math.ceil(activeTotal / PAGE_SIZE));
  const visibleCount =
    tab === "students" ? studentRows.length : counselorRows.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row with View Actions Dropdown (Figma 678:20767 & 736:1723) */}
      <PageHeader
        title="Accounts & Directory Management"
        description="Oversee student profiles, licensed guidance counselors, and college department allocations"
        actions={
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                View Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-64">
              <DropdownMenuItem onSelect={() => setOpen({ kind: "create" })}>
                <UserPlus strokeWidth={1.5} className="size-4" />
                Register Guidance Counselor
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setOpen({ kind: "manage-departments" })}
              >
                <Building2 strokeWidth={1.5} className="size-4" />
                Manage Colleges &amp; Departments
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOpen({ kind: "export" })}>
                <Download strokeWidth={1.5} className="size-4" />
                Export Institutional Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Main White Directory Card (Figma 678:20767) */}
      <div className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5">
        <PillTabs
          ariaLabel="Account directory view"
          value={tab}
          onChange={(next) => {
            setTab(next as AccountType);
            setPage(0);
            setCollegeFilter("all");
          }}
          options={[
            {
              value: "students",
              label: `Student Directory (${studentTotal})`,
            },
            {
              value: "counselors",
              label: `Guidance Counselors (${counselorTotal})`,
            },
          ]}
        />

        {/* Search + Academic College Filter Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="border-border bg-card shadow-steady-card flex h-12 flex-1 items-center gap-3 rounded-[25px] border px-5">
            <Search
              strokeWidth={1.5}
              className="text-muted-foreground size-4 shrink-0"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by name, student number, or email"
              className="w-full bg-transparent text-[15px] outline-none"
            />
          </div>

          <Select
            value={collegeFilter}
            onValueChange={(v) => {
              setCollegeFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Academic Colleges" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Academic College</SelectLabel>
                <SelectItem value="all">All Academic Colleges</SelectItem>
                {colleges.map((college) => (
                  <SelectItem key={college} value={college}>
                    {college}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Table Container */}
        {activeQuery.isError ? (
          <ErrorState
            title={`Couldn't load ${tab}`}
            onRetry={() => activeQuery.refetch()}
          />
        ) : (
          <div className="border-border shadow-steady-card overflow-x-auto rounded-[20px] border">
            {tab === "students" ? (
              <table className="w-full min-w-[820px] border-collapse text-left text-[15px]">
                <thead>
                  <tr className="border-border text-foreground border-b text-[15px]">
                    <th className="px-5 py-4 font-medium">Student Name</th>
                    <th className="px-4 py-4 font-medium">University ID</th>
                    <th className="px-4 py-4 font-medium">
                      Academic College and Program
                    </th>
                    <th className="px-4 py-4 font-medium">Contact</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {students.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-5 py-4">
                          <Skeleton className="h-11 w-full rounded-[12px]" />
                        </td>
                      </tr>
                    ))
                  ) : studentRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-muted-foreground px-5 py-10 text-center text-[15px]"
                      >
                        No students match your current filter.
                      </td>
                    </tr>
                  ) : (
                    studentRows.map((row) => {
                      const fullName =
                        `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() ||
                        row.username ||
                        "Student";
                      const yearStr = formatOrdinalYear(row.year_level);
                      const programLine = [row.department, yearStr]
                        .filter(Boolean)
                        .join(", ");
                      return (
                        <tr
                          key={row.id ?? row.email}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3.5">
                              <UserAvatar
                                name={fullName}
                                className="size-11 shrink-0 rounded-[10px]"
                              />
                              <div className="min-w-0">
                                <p className="text-foreground truncate font-medium">
                                  {fullName}
                                </p>
                                <p className="text-muted-foreground truncate text-[14px]">
                                  {row.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-foreground px-4 py-4 whitespace-nowrap tabular-nums">
                            {row.university_id || "—"}
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-foreground font-normal">
                              {row.college_name || row.department || "—"}
                            </p>
                            {programLine && (
                              <p className="text-muted-foreground text-[14px]">
                                {programLine}
                              </p>
                            )}
                          </td>
                          <td className="text-foreground/90 px-4 py-4 text-[14px]">
                            {row.phone || row.username || "—"}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button
                              type="button"
                              onClick={() => setOpen({ kind: "student", row })}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[780px] border-collapse text-left text-[15px]">
                <thead>
                  <tr className="border-border text-foreground border-b text-[15px]">
                    <th className="px-5 py-4 font-medium">Counselor Name</th>
                    <th className="px-4 py-4 font-medium">
                      Assigned Departments
                    </th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {counselors.isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={4} className="px-5 py-4">
                          <Skeleton className="h-11 w-full rounded-[12px]" />
                        </td>
                      </tr>
                    ))
                  ) : counselorRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-muted-foreground px-5 py-10 text-center text-[15px]"
                      >
                        No counselors match your current filter.
                      </td>
                    </tr>
                  ) : (
                    counselorRows.map((row) => {
                      const fullName =
                        `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() ||
                        row.username ||
                        "Counselor";
                      return (
                        <tr
                          key={row.id ?? row.email}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3.5">
                              <UserAvatar
                                name={fullName}
                                src={row.avatar ?? undefined}
                                className="size-11 shrink-0 rounded-[10px]"
                              />
                              <div className="min-w-0">
                                <p className="text-foreground truncate font-medium">
                                  {fullName}
                                </p>
                                <p className="text-muted-foreground truncate text-[14px]">
                                  {row.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="text-foreground px-4 py-4">
                            {row.department || (
                              <span className="text-muted-foreground">
                                None assigned
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {row.is_active ? (
                              <span className="inline-flex items-center rounded-[35px] bg-[#a4f4cf] px-3 py-1 text-[14px] text-[#007a55] dark:bg-emerald-950/70 dark:text-emerald-200">
                                Accepting
                              </span>
                            ) : (
                              <span className="bg-muted text-muted-foreground inline-flex items-center rounded-[35px] px-3 py-1 text-[14px]">
                                Unavailable
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button
                              type="button"
                              onClick={() =>
                                setOpen({ kind: "counselor", row })
                              }
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-muted-foreground text-[15px]">
            View {visibleCount} out of {activeTotal} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page + 1 >= activePageCount}
              onClick={() =>
                setPage((p) => Math.min(activePageCount - 1, p + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {open?.kind === "student" && (
        <StudentEditDialog student={open.row} onClose={() => setOpen(null)} />
      )}
      {open?.kind === "counselor" && (
        <CounselorEditDialog
          counselor={open.row}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === "manage-departments" && (
        <ManageDepartmentsDialog onClose={() => setOpen(null)} />
      )}
      {open?.kind === "create" && (
        <CounselorCreateDialog onClose={() => setOpen(null)} />
      )}
      {open?.kind === "export" && (
        <ExportDialog defaultType={tab} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}
