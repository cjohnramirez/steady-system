"use client";

import { useMemo, useState, useTransition } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CalendarCheck, Check, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { UserAvatar } from "@/components/app/user-avatar";
import { useSignedInViewer } from "@/components/viewer-provider";
import { PendingSessionDetailsDialog } from "@/components/counselor/pending-session-details-dialog";
import {
  CounselorRescheduleDialog,
  type CounselorRescheduleTarget,
} from "@/components/counselor/reschedule-appointment-dialog";
import {
  CompletedSessionDetailsDialog,
  type CompletedSessionInfo,
} from "@/components/student/completed-session-details-dialog";
import { useConfirm } from "@/hooks/use-confirm";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import { setAppointmentStatus } from "@/lib/appointments/actions";
import {
  fetchCounselorAppointments,
  type AppointmentRow,
} from "@/lib/appointments/queries";
import type { AppointmentStatus } from "@/lib/appointments/status";
import { formatAppointmentDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

const DATE_SUGGESTIONS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "2025",
  "2026",
  "2027",
] as const;

type DisplayStatus =
  | "pending"
  | "approved"
  | "missed"
  | "completed"
  | "cancelled"
  | "rejected";

const STATUS_PILL_STYLES: Record<DisplayStatus, string> = {
  pending:
    "bg-[#fed7aa] text-[#9a3412] dark:bg-amber-950/70 dark:text-amber-200",
  approved:
    "bg-[#dbeafe] text-[#1d4ed8] dark:bg-blue-950/70 dark:text-blue-200",
  missed:
    "bg-[#e9d5ff] text-[#6b21a8] dark:bg-purple-950/70 dark:text-purple-200",
  completed:
    "bg-[#34d399] text-[#064e3b] dark:bg-emerald-900/70 dark:text-emerald-200",
  cancelled:
    "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  rejected:
    "bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-red-300",
};

const STATUS_LABELS: Record<DisplayStatus, string> = {
  pending: "Pending",
  approved: "Confirmed",
  missed: "Missed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Declined",
};

/**
 * Appointment Lifecycle:
 * - Pending -> Confirm / Decline / Reschedule
 * - Confirmed (upcoming) -> Session occurs on Daily Checking -> Completed (SOAP + Action Plan unlocked)
 * - Confirmed (scheduled time passed without completion) -> automatically marked "Missed" (Reschedule only, no SOAP/Action Plan)
 */
function resolveDisplayStatus(row: AppointmentRow): DisplayStatus {
  const raw = (row.status ?? "pending") as AppointmentStatus;
  if (raw === "approved" && row.scheduled_at) {
    const scheduledMs = new Date(row.scheduled_at).getTime();
    if (!Number.isNaN(scheduledMs) && scheduledMs < Date.now()) {
      return "missed";
    }
  }
  return raw;
}

export default function AppointmentList({
  studentCourseMap = {},
  initialStudentName,
  initialSort = "date_desc",
}: {
  studentCourseMap?: Record<string, string>;
  studentNames?: string[];
  initialStudentName?: string;
  initialSort?: "name" | "date_desc" | "date_asc" | "status";
}) {
  const viewer = useSignedInViewer();
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>(
    "all",
  );
  const [sortBy, setSortBy] = useState<
    "name" | "date_desc" | "date_asc" | "status"
  >(initialSort);
  const [activeFlag, setActiveFlag] = useState<"course" | "date" | null>(null);
  const [flagDropdownOpen, setFlagDropdownOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const [search, setSearch] = useState(initialStudentName?.trim() ?? "");
  const [page, setPage] = useState(0);
  const [pendingDetail, setPendingDetail] = useState<AppointmentRow | null>(
    null,
  );
  const [completedDetail, setCompletedDetail] =
    useState<CompletedSessionInfo | null>(null);
  const [rescheduleTarget, setRescheduleTarget] =
    useState<CounselorRescheduleTarget | null>(null);
  const [isMutating, startTransition] = useTransition();

  const debouncedSearch = useDebouncedValue(search);
  const counselorName =
    `${viewer.firstName} ${viewer.lastName}`.trim() || viewer.userName;

  const uniqueCourses = useMemo(() => {
    const set = new Set<string>();
    for (const val of Object.values(studentCourseMap)) {
      const dept = val.split(",")[0]?.trim();
      if (dept) set.add(dept);
    }
    return Array.from(set).sort();
  }, [studentCourseMap]);

  const matchingFlagOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (activeFlag === "course") {
      return q
        ? uniqueCourses.filter((c) => c.toLowerCase().includes(q))
        : uniqueCourses;
    }
    if (activeFlag === "date") {
      return q
        ? DATE_SUGGESTIONS.filter((d) => d.toLowerCase().includes(q))
        : [...DATE_SUGGESTIONS];
    }
    return [];
  }, [activeFlag, search, uniqueCourses]);

  const safeHighlightedIdx =
    matchingFlagOptions.length > 0
      ? Math.min(highlightedIdx, matchingFlagOptions.length - 1)
      : 0;

  function handleSearchChange(val: string) {
    if (!activeFlag) {
      const courseMatch = val.match(/^course:\s*(.*)$/i);
      if (courseMatch) {
        setActiveFlag("course");
        setFlagDropdownOpen(true);
        setHighlightedIdx(0);
        setSearch(courseMatch[1]);
        setPage(0);
        return;
      }
      const dateMatch = val.match(/^date:\s*(.*)$/i);
      if (dateMatch) {
        setActiveFlag("date");
        setFlagDropdownOpen(true);
        setHighlightedIdx(0);
        setSearch(dateMatch[1]);
        setPage(0);
        return;
      }
    } else {
      setFlagDropdownOpen(true);
      setHighlightedIdx(0);
    }
    setSearch(val);
    setPage(0);
  }

  const sortParam = useMemo(() => {
    if (sortBy === "name") return { id: "last_student_name", desc: false };
    if (sortBy === "date_asc") return { id: "scheduled_at", desc: false };
    if (sortBy === "status") return { id: "status", desc: false };
    return { id: "scheduled_at", desc: true };
  }, [sortBy]);

  const params = {
    page: activeFlag ? 0 : page,
    pageSize: activeFlag ? 50 : PAGE_SIZE,
    search: activeFlag ? "" : debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
    sort: sortParam,
  };

  const appointments = useQuery({
    queryKey: queryKeys.appointments.forCounselor(viewer.profileId, params),
    queryFn: () =>
      fetchCounselorAppointments(supabase, viewer.profileId, params),
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => {
    const rawRows = appointments.data?.data ?? [];
    if (!activeFlag || !debouncedSearch.trim()) return rawRows;
    const q = debouncedSearch.trim().toLowerCase();
    if (activeFlag === "course") {
      return rawRows.filter((r) =>
        ((r.student_id && studentCourseMap[r.student_id]) || "")
          .toLowerCase()
          .includes(q),
      );
    }
    return rawRows.filter((r) =>
      formatAppointmentDate(r.scheduled_at).toLowerCase().includes(q),
    );
  }, [activeFlag, appointments.data?.data, debouncedSearch, studentCourseMap]);

  const totalCount = activeFlag ? rows.length : (appointments.data?.count ?? 0);
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasPrev = !activeFlag && page > 0;
  const hasNext = !activeFlag && page + 1 < pageCount;

  async function refreshAll() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.availableSlots.all }),
    ]);
  }

  function handleApprove(row: AppointmentRow) {
    if (!row.id) return;
    const id = row.id;
    startTransition(async () => {
      const res = await setAppointmentStatus(id, "approved");
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Appointment confirmed.");
      setPendingDetail(null);
      await refreshAll();
    });
  }

  function handleDecline(row: AppointmentRow) {
    if (!row.id) return;
    const id = row.id;
    void confirm({
      title: "Decline This Request?",
      description:
        "The student will be notified and can pick another open slot.",
      confirmLabel: "Decline Request",
      cancelLabel: "Keep Pending",
      destructive: true,
      action: async () => {
        const res = await setAppointmentStatus(id, "rejected");
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success("Appointment request declined.");
        setPendingDetail(null);
        await refreshAll();
      },
    });
  }

  function openReschedule(row: AppointmentRow) {
    if (!row.id) return;
    const studentName =
      `${row.first_student_name ?? ""} ${row.last_student_name ?? ""}`.trim() ||
      "Student";
    setRescheduleTarget({
      appointmentId: row.id,
      studentName,
      counselorId: viewer.profileId,
      counselorName,
    });
  }

  function openRowDetail(row: AppointmentRow) {
    const displayStatus = resolveDisplayStatus(row);
    if (displayStatus === "pending") {
      setPendingDetail(row);
      return;
    }
    if (displayStatus === "completed" && row.id) {
      setCompletedDetail({
        id: row.id,
        status: "completed",
        scheduledLabel: formatAppointmentDate(row.scheduled_at),
        reason: row.reason ?? "General Consultation",
        notes: row.notes,
      });
      return;
    }
    // Missed or Confirmed sessions open the Reschedule dialog (no SOAP/Action Plan until completed)
    if (displayStatus === "missed" || displayStatus === "approved") {
      openReschedule(row);
    }
  }

  return (
    <div className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5">
      {/* Search + Status + Sort Toolbar (Figma 678:17396) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <div className="bg-card border-border focus-within:ring-ring/40 flex h-12 w-full items-center gap-2 rounded-[25px] border px-4 transition-shadow focus-within:ring-[3px]">
            <Search
              aria-hidden
              strokeWidth={1.5}
              className="text-muted-foreground size-4 shrink-0"
            />
            {activeFlag && (
              <span className="bg-brand-subtle text-brand-subtle-foreground inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-medium">
                <span>{activeFlag === "course" ? "Course:" : "Date:"}</span>
                <button
                  type="button"
                  aria-label={`Remove ${activeFlag} filter flag`}
                  onClick={() => {
                    setActiveFlag(null);
                    setFlagDropdownOpen(false);
                    setSearch("");
                    setPage(0);
                  }}
                  className="hover:text-foreground cursor-pointer rounded-full p-0.5 transition-colors"
                >
                  <X strokeWidth={1.75} className="size-3" />
                </button>
              </span>
            )}
            <input
              type="text"
              value={search}
              role="combobox"
              aria-controls="counselor-flag-suggestions"
              aria-expanded={Boolean(activeFlag) && flagDropdownOpen}
              aria-autocomplete="list"
              onFocus={() => {
                if (activeFlag) {
                  setFlagDropdownOpen(true);
                  setHighlightedIdx(0);
                }
              }}
              onBlur={() => {
                window.setTimeout(() => setFlagDropdownOpen(false), 150);
              }}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && activeFlag && search === "") {
                  setActiveFlag(null);
                  setFlagDropdownOpen(false);
                } else if (e.key === "Escape") {
                  setFlagDropdownOpen(false);
                } else if (
                  activeFlag &&
                  flagDropdownOpen &&
                  matchingFlagOptions.length > 0
                ) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlightedIdx(
                      (prev) => (prev + 1) % matchingFlagOptions.length,
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedIdx(
                      (prev) =>
                        (prev - 1 + matchingFlagOptions.length) %
                        matchingFlagOptions.length,
                    );
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const picked = matchingFlagOptions[safeHighlightedIdx];
                    if (picked) {
                      setSearch(picked);
                      setFlagDropdownOpen(false);
                      setPage(0);
                    }
                  }
                }
              }}
              placeholder={
                activeFlag === "course"
                  ? "Type a course or department..."
                  : activeFlag === "date"
                    ? "Filter by month, day, or year (e.g. Sep, 15, 2026)..."
                    : 'Search by student name, or type "Course:" / "Date:"...'
              }
              aria-label="Search counselor appointments"
              className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-[15px] outline-none"
            />
          </div>

          {/* Progressive Flag Dropdown (Course or Date) with keyboard arrow navigation */}
          {activeFlag && flagDropdownOpen && (
            <div
              id="counselor-flag-suggestions"
              role="listbox"
              className="bg-popover border-border shadow-steady-card absolute top-[calc(100%+6px)] left-0 z-30 max-h-[220px] w-full max-w-[340px] overflow-y-auto rounded-[15px] border p-2"
            >
              <p className="text-muted-foreground px-3 py-1.5 text-left text-[13px] font-medium">
                {activeFlag === "course"
                  ? "Courses & Departments"
                  : "Filter by Month or Year"}
              </p>
              {matchingFlagOptions.length === 0 ? (
                <p className="text-muted-foreground px-3 py-2.5 text-left text-[14px]">
                  {activeFlag === "course"
                    ? "No matching courses"
                    : "Type a month, day, or year"}
                </p>
              ) : (
                matchingFlagOptions.map((course, idx) => {
                  const isHighlighted = idx === safeHighlightedIdx;
                  const isSelected =
                    search.toLowerCase() === course.toLowerCase();
                  return (
                    <button
                      key={course}
                      type="button"
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseEnter={() => setHighlightedIdx(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearch(course);
                        setFlagDropdownOpen(false);
                        setPage(0);
                      }}
                      className={cn(
                        "text-foreground flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 text-left text-[14px] transition-colors",
                        isHighlighted
                          ? "bg-muted font-medium"
                          : "hover:bg-muted/60",
                      )}
                    >
                      <span className="truncate">{course}</span>
                      {isSelected && (
                        <Check
                          aria-hidden
                          strokeWidth={1.5}
                          className="text-primary size-4 shrink-0"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as "all" | AppointmentStatus);
            setPage(0);
          }}
        >
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rejected">Declined</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value as "name" | "date_desc" | "date_asc" | "status");
            setPage(0);
          }}
        >
          <SelectTrigger aria-label="Sort appointments">
            <SelectValue placeholder="Sort by Name" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort Order</SelectLabel>
              <SelectItem value="date_desc">Sort by Newest</SelectItem>
              <SelectItem value="date_asc">Sort by Oldest</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="status">Sort by Status</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Stacked Row Cards using CSS Subgrid: every column hugs content & aligns across ALL rows */}
      <div
        className={cn(
          "grid grid-cols-1 gap-y-2 transition-opacity lg:grid-cols-[auto_auto_auto_auto_1fr]",
          (appointments.isFetching || isMutating) &&
            !appointments.isLoading &&
            "opacity-75",
        )}
        aria-busy={appointments.isFetching || isMutating}
      >
        {appointments.isLoading ? (
          Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-[84px] rounded-[20px] lg:col-span-5"
            />
          ))
        ) : appointments.isError ? (
          <div className="lg:col-span-5">
            <ErrorState
              title="Appointments Couldn't Be Loaded"
              onRetry={() => appointments.refetch()}
            />
          </div>
        ) : rows.length === 0 ? (
          <div className="lg:col-span-5">
            <EmptyState
              icon={CalendarCheck}
              title={
                statusFilter === "pending"
                  ? "No Requests Waiting"
                  : "No Appointments Found"
              }
              description={
                debouncedSearch || statusFilter !== "all"
                  ? "Try clearing your search or status filter."
                  : "New student requests will appear here as students book."
              }
              action={
                debouncedSearch || statusFilter !== "all" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setPage(0);
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          rows.map((row) => {
            const studentName =
              `${row.first_student_name ?? ""} ${row.last_student_name ?? ""}`.trim() ||
              "Student";
            const displayStatus = resolveDisplayStatus(row);
            const pillStyle = STATUS_PILL_STYLES[displayStatus];
            const statusLabel = STATUS_LABELS[displayStatus];
            const isUrgent =
              "urgency" in row &&
              (row as { urgency?: string | null }).urgency === "high";
            const isClickable =
              displayStatus === "pending" ||
              displayStatus === "completed" ||
              displayStatus === "missed" ||
              displayStatus === "approved";

            return (
              <div
                key={row.id}
                onClick={() => isClickable && openRowDetail(row)}
                className={cn(
                  "bg-card border-border shadow-steady-card grid grid-cols-1 items-center gap-x-7 gap-y-3 rounded-[20px] border px-5 py-4 transition-colors lg:col-span-5 lg:grid-cols-subgrid",
                  isClickable && "hover:border-foreground/30 cursor-pointer",
                )}
              >
                {/* Column 1: Student Avatar + Name + ID (hugs content) */}
                <div className="flex max-w-[240px] min-w-0 items-center gap-3.5">
                  <UserAvatar
                    name={studentName}
                    className="size-11 shrink-0 rounded-[10px]"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <p className="privacy-sensitive text-foreground truncate text-[15px] leading-snug font-medium">
                      {studentName}
                    </p>
                    <p className="text-muted-foreground privacy-sensitive truncate text-[14px] leading-snug">
                      {row.student_university_id ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Column 2: Course and Year (hugs content) */}
                <div className="max-w-[220px] min-w-0 space-y-0.5">
                  <p className="text-foreground text-[14px] leading-snug font-medium whitespace-nowrap">
                    Course and Year
                  </p>
                  <p className="text-foreground/85 truncate text-[14px] leading-snug">
                    {(row.student_id && studentCourseMap[row.student_id]) ||
                      "Undergraduate"}
                  </p>
                </div>

                {/* Column 3: Scheduled At (hugs content) */}
                <div className="max-w-[210px] min-w-0 space-y-0.5">
                  <p className="text-foreground text-[14px] leading-snug font-medium whitespace-nowrap">
                    Scheduled At
                  </p>
                  <p className="text-foreground/85 truncate text-[14px] leading-snug">
                    {formatAppointmentDate(row.scheduled_at)}
                  </p>
                </div>

                {/* Column 4: Status + Optional Urgent Badge (hugs content) */}
                <div className="min-w-0 space-y-1">
                  <p className="text-foreground text-[14px] leading-snug font-medium whitespace-nowrap">
                    Status
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-[13px] font-medium whitespace-nowrap",
                        pillStyle,
                      )}
                    >
                      {statusLabel}
                    </span>
                    {isUrgent && (
                      <span className="bg-destructive/15 text-destructive inline-flex items-center justify-center rounded-full px-3 py-0.5 text-[13px] font-medium whitespace-nowrap">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>

                {/* Column 5: Actions pinned right */}
                <div
                  className="flex items-center justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {displayStatus === "pending" && (
                    <>
                      <button
                        type="button"
                        aria-label={`Confirm appointment for ${studentName}`}
                        disabled={isMutating}
                        onClick={() => handleApprove(row)}
                        className="bg-positive shadow-steady-pill flex size-12 cursor-pointer items-center justify-center rounded-full text-white transition-transform hover:opacity-95 active:scale-95 disabled:opacity-50"
                      >
                        <Check strokeWidth={2} className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Decline appointment for ${studentName}`}
                        disabled={isMutating}
                        onClick={() => handleDecline(row)}
                        className="bg-destructive shadow-steady-pill flex size-12 cursor-pointer items-center justify-center rounded-full text-white transition-transform hover:opacity-95 active:scale-95 disabled:opacity-50"
                      >
                        <X strokeWidth={2} className="size-4" />
                      </button>
                    </>
                  )}

                  {(displayStatus === "missed" ||
                    displayStatus === "approved") && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openReschedule(row)}
                    >
                      Reschedule
                    </Button>
                  )}

                  {displayStatus === "completed" && (
                    <Button
                      type="button"
                      onClick={() => openRowDetail(row)}
                      className="px-5"
                    >
                      View Full Session Details
                    </Button>
                  )}

                  {(displayStatus === "cancelled" ||
                    displayStatus === "rejected") && (
                    <span className="text-muted-foreground text-[14px]">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-muted-foreground text-[14px]">
          View {rows.length} out of {totalCount}{" "}
          {totalCount === 1 ? "result" : "results"}
        </p>
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={!hasPrev}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-5"
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-5"
          >
            Next
          </Button>
        </div>
      </div>

      <PendingSessionDetailsDialog
        open={Boolean(pendingDetail)}
        onOpenChange={(open) => {
          if (!open) setPendingDetail(null);
        }}
        session={
          pendingDetail && pendingDetail.id
            ? {
                id: pendingDetail.id,
                studentName:
                  `${pendingDetail.first_student_name ?? ""} ${pendingDetail.last_student_name ?? ""}`.trim() ||
                  "Student",
                studentUniversityId: String(
                  pendingDetail.student_university_id ?? "—",
                ),
                courseAndYear:
                  (pendingDetail.student_id &&
                    studentCourseMap[pendingDetail.student_id]) ||
                  "Undergraduate",
                scheduledLabel: formatAppointmentDate(
                  pendingDetail.scheduled_at,
                ),
                reason: pendingDetail.reason ?? "General Consultation",
              }
            : null
        }
        onReschedule={() => {
          if (pendingDetail) {
            const target = pendingDetail;
            setPendingDetail(null);
            openReschedule(target);
          }
        }}
      />

      <CounselorRescheduleDialog
        open={Boolean(rescheduleTarget)}
        onOpenChange={(open) => {
          if (!open) setRescheduleTarget(null);
        }}
        target={rescheduleTarget}
      />

      <CompletedSessionDetailsDialog
        open={Boolean(completedDetail)}
        onOpenChange={(open) => {
          if (!open) setCompletedDetail(null);
        }}
        session={completedDetail}
      />
    </div>
  );
}
