"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Search, X } from "lucide-react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
import { LinkPending } from "@/components/app/link-pending";
import { UserAvatar } from "@/components/app/user-avatar";
import { useSignedInViewer } from "@/components/viewer-provider";
import { CounselorDetailsDialog } from "@/components/student/counselor-details-dialog";
import {
  CompletedSessionDetailsDialog,
  type CompletedSessionInfo,
} from "@/components/student/completed-session-details-dialog";
import {
  RescheduleSessionDialog,
  type RescheduleSessionTarget,
} from "@/components/student/reschedule-session-dialog";
import { useConfirm } from "@/hooks/use-confirm";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import { cancelAppointment } from "@/lib/appointments/actions";
import {
  fetchStudentAppointments,
  type AppointmentRow,
} from "@/lib/appointments/queries";
import type { AppointmentStatus } from "@/lib/appointments/status";
import { fetchCounselorsForDepartment } from "@/lib/counselors/queries";
import { fetchStudentDetails } from "@/lib/students/queries";
import { formatAppointmentDate, formatClockTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

const STATUS_PILL_STYLES: Record<string, string> = {
  pending:
    "bg-[#fed7aa] text-[#9a3412] dark:bg-amber-950/70 dark:text-amber-200",
  approved:
    "bg-[#dbeafe] text-[#1d4ed8] dark:bg-blue-950/70 dark:text-blue-200",
  completed:
    "bg-[#34d399] text-[#064e3b] dark:bg-emerald-900/70 dark:text-emerald-200",
  cancelled:
    "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  rejected:
    "bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-red-300",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Declined",
};

export default function StudentAppointmentSection() {
  const viewer = useSignedInViewer();
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>(
    "all",
  );
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "status">(
    "date_desc",
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [counselorDialogOpen, setCounselorDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<CompletedSessionInfo | null>(null);
  const [rescheduleTarget, setRescheduleTarget] =
    useState<RescheduleSessionTarget | null>(null);

  const debouncedSearch = useDebouncedValue(search);
  const trimmedSearch = debouncedSearch.trim();
  const isIdSearch = /^#?[0-9a-f]{2,8}$/i.test(trimmedSearch);
  const idSearchNeedle = trimmedSearch.replace(/^#/, "").toLowerCase();

  const sortParam = useMemo(() => {
    if (sortBy === "date_asc") return { id: "scheduled_at", desc: false };
    if (sortBy === "status") return { id: "status", desc: false };
    return { id: "scheduled_at", desc: true };
  }, [sortBy]);

  const params = {
    page: isIdSearch ? 0 : pageIndex,
    pageSize: isIdSearch ? 50 : PAGE_SIZE,
    search: isIdSearch ? "" : trimmedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
    sort: sortParam,
  };

  const appointments = useQuery({
    queryKey: queryKeys.appointments.forStudent(viewer.profileId, params),
    queryFn: () => fetchStudentAppointments(supabase, viewer.profileId, params),
    placeholderData: keepPreviousData,
  });

  const student = useQuery({
    queryKey: queryKeys.students.detail(viewer.profileId),
    queryFn: () => fetchStudentDetails(supabase, viewer.profileId),
  });

  const departmentId = student.data?.department_id ?? "";
  const counselors = useQuery({
    queryKey: queryKeys.counselors.forStudent(viewer.profileId),
    queryFn: () => fetchCounselorsForDepartment(supabase, departmentId),
    enabled: Boolean(departmentId),
  });

  const counselor = counselors.data?.[0];
  const counselorName = counselor
    ? `${counselor.first_name ?? ""} ${counselor.last_name ?? ""}`.trim()
    : "Assigned Counselor";
  const officeRoom = "West Hall Room 204";
  const officeHours = counselor
    ? `${formatClockTime(counselor.start_time)} – ${formatClockTime(counselor.end_time)}`
    : "08:30 AM – 05:00 PM";
  const availableWeekdays = (counselor?.day_of_week ?? [])
    .map((open, idx) => (open ? idx : -1))
    .filter((idx) => idx >= 0);

  const rawRows = appointments.data?.data ?? [];
  const rows = isIdSearch
    ? rawRows.filter((r) =>
        (r.id ?? "").toLowerCase().startsWith(idSearchNeedle),
      )
    : rawRows;
  const totalCount = isIdSearch ? rows.length : (appointments.data?.count ?? 0);
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasPrev = !isIdSearch && pageIndex > 0;
  const hasNext = !isIdSearch && pageIndex + 1 < pageCount;

  function handleCancel(row: AppointmentRow) {
    if (!row.id) return;
    const id = row.id;
    void confirm({
      title: "Cancel This Appointment?",
      description:
        "Your counselor will be notified and the time slot will be freed up.",
      confirmLabel: "Cancel Request",
      cancelLabel: "Keep It",
      destructive: true,
      action: async () => {
        const result = await cancelAppointment(id);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Appointment request cancelled.");
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.appointments.all,
          }),
          queryClient.invalidateQueries({
            queryKey: queryKeys.availableSlots.all,
          }),
        ]);
      },
    });
  }

  const studentName =
    `${student.data?.first_name ?? ""} ${student.data?.last_name ?? ""}`.trim() ||
    "Student";

  function openSessionDetails(row: AppointmentRow) {
    if (!row.id) return;
    setSelectedSession({
      id: row.id,
      status: row.status,
      scheduledLabel: formatAppointmentDate(row.scheduled_at),
      reason: row.reason ?? "Other Personal Concern",
      notes: row.notes,
    });
  }

  function openRescheduleForSession(session: CompletedSessionInfo) {
    if (!counselor?.id) {
      toast.error("No assigned counselor found for rescheduling.");
      return;
    }
    setRescheduleTarget({
      appointmentId: session.id,
      appointmentStatus: session.status ?? "pending",
      reason: session.reason,
      studentName,
      counselorId: counselor.id,
      counselorName,
      counselorDays: counselor.day_of_week,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Assigned Counselor Bar (Figma 678:19911) */}
      {counselor && (
        <div className="bg-card border-border shadow-steady-card flex flex-wrap items-center justify-between gap-5 rounded-[20px] border p-5">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-4">
              <UserAvatar
                name={counselorName}
                src={counselor.avatar}
                className="size-11 shrink-0 rounded-[10px]"
              />
              <div className="min-w-0">
                <p className="text-foreground text-[15px] font-medium">
                  {counselorName}
                </p>
                <p className="text-muted-foreground text-[14px]">
                  Counselor for {student.data?.department ?? "Guidance Office"}
                </p>
              </div>
            </div>

            <div className="space-y-0.5">
              <p className="text-foreground text-[14px] font-medium">
                Office Location
              </p>
              <p className="text-muted-foreground text-[14px]">{officeRoom}</p>
            </div>

            <div className="space-y-0.5">
              <p className="text-foreground text-[14px] font-medium">
                Office Hours
              </p>
              <p className="text-muted-foreground text-[14px]">{officeHours}</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setCounselorDialogOpen(true)}
            className="px-6"
          >
            View Details
          </Button>
        </div>
      )}

      {/* Main Card-List Container (Figma 678:19934) */}
      <div className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5">
        {/* Search + Filter + Sort Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-card border-border focus-within:ring-ring/40 flex h-12 min-w-[220px] flex-1 items-center gap-2.5 rounded-[25px] border px-4 transition-shadow focus-within:ring-[3px]">
            <Search
              aria-hidden
              strokeWidth={1.5}
              className="text-muted-foreground size-4 shrink-0"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              placeholder="Search by ID, reason, or counselor..."
              aria-label="Search appointments"
              className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-[14px] outline-none"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val as "all" | AppointmentStatus);
              setPageIndex(0);
            }}
          >
            <SelectTrigger>
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
            onValueChange={(val) => {
              setSortBy(val as "date_desc" | "date_asc" | "status");
              setPageIndex(0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort Order</SelectLabel>
                <SelectItem value="date_desc">Sort by Newest</SelectItem>
                <SelectItem value="date_asc">Sort by Oldest</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Appointment Row Cards */}
        {appointments.isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[84px] rounded-[20px]" />
            ))}
          </div>
        ) : appointments.isError ? (
          <ErrorState
            title="Your Appointments Couldn't Be Loaded"
            description="Check your connection and try again."
            onRetry={() => appointments.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title={
              debouncedSearch || statusFilter !== "all"
                ? "No Matching Appointments"
                : "No Appointments Yet"
            }
            description={
              debouncedSearch || statusFilter !== "all"
                ? "Try clearing your search or status filter."
                : "Book a confidential session whenever you're ready."
            }
            action={
              debouncedSearch || statusFilter !== "all" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setPageIndex(0);
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/student/appointment">Book a Session</Link>
                </Button>
              )
            }
          />
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 gap-y-2 transition-opacity lg:grid-cols-[auto_auto_auto_auto_1fr]",
              appointments.isFetching && "opacity-75",
            )}
          >
            {rows.map((row) => {
              const status = row.status ?? "pending";
              const isCancellable =
                status === "pending" || status === "approved";
              const pillStyle =
                STATUS_PILL_STYLES[status] ?? STATUS_PILL_STYLES.pending;
              const statusLabel = STATUS_LABELS[status] ?? status;

              const shortId = row.id ? row.id.slice(0, 6).toUpperCase() : "—";

              return (
                <div
                  key={row.id}
                  onClick={() => openSessionDetails(row)}
                  className="bg-card border-border shadow-steady-card hover:border-foreground/30 grid cursor-pointer grid-cols-1 items-center gap-x-7 gap-y-3 rounded-[20px] border px-5 py-4 transition-colors lg:col-span-5 lg:grid-cols-subgrid"
                >
                  {/* ID (hugs content) */}
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-foreground text-[14px] font-medium whitespace-nowrap">
                      ID
                    </p>
                    <p className="text-foreground/85 truncate text-[14px]">
                      {shortId}
                    </p>
                  </div>

                  {/* Scheduled At (hugs content) */}
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-foreground text-[14px] font-medium whitespace-nowrap">
                      Scheduled At
                    </p>
                    <p className="text-foreground/85 truncate text-[14px]">
                      {formatAppointmentDate(row.scheduled_at)}
                    </p>
                  </div>

                  {/* Status (hugs content) */}
                  <div className="min-w-0 space-y-1">
                    <p className="text-foreground text-[14px] font-medium whitespace-nowrap">
                      Status
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-[13px] font-medium whitespace-nowrap",
                        pillStyle,
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Reason (hugs content up to max-w) */}
                  <div className="max-w-[260px] min-w-0 space-y-0.5">
                    <p className="text-foreground text-[14px] font-medium whitespace-nowrap">
                      Reason
                    </p>
                    <p className="text-foreground/85 truncate text-[14px]">
                      {row.reason || "Other Personal Concern"}
                    </p>
                  </div>

                  {/* Action Pill Button */}
                  <div
                    className="flex items-center justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isCancellable ? (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleCancel(row)}
                        className="px-5"
                      >
                        Cancel Request
                        <X strokeWidth={1.5} className="size-4" />
                      </Button>
                    ) : (
                      <Button asChild className="px-5">
                        <Link
                          href={`/student/appointment?reason=${encodeURIComponent(row.reason ?? "")}`}
                        >
                          <LinkPending />
                          Book Again
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              className="px-5"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!hasNext}
              onClick={() => setPageIndex((p) => p + 1)}
              className="px-5"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {counselor && (
        <CounselorDetailsDialog
          open={counselorDialogOpen}
          onOpenChange={setCounselorDialogOpen}
          counselor={{
            id: counselor.id ?? "",
            name: counselorName,
            department: student.data?.department ?? "Guidance Office",
            roleTitle: "Guidance Counselor, RGC",
            email: counselor.email,
            avatar: counselor.avatar,
            officeRoom,
            officeHours,
            availableWeekdays,
          }}
        />
      )}

      <CompletedSessionDetailsDialog
        open={Boolean(selectedSession)}
        onOpenChange={(open) => {
          if (!open) setSelectedSession(null);
        }}
        session={selectedSession}
        onReschedule={
          selectedSession
            ? () => openRescheduleForSession(selectedSession)
            : undefined
        }
      />

      <RescheduleSessionDialog
        open={Boolean(rescheduleTarget)}
        onOpenChange={(open) => {
          if (!open) setRescheduleTarget(null);
        }}
        target={rescheduleTarget}
      />
    </div>
  );
}
