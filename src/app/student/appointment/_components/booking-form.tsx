"use client";

import { useId, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Award,
  BatteryLow,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  Library,
  Mail,
  MapPin,
  Phone,
  Sprout,
  UserRoundX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { SteadyMascot } from "@/components/app/steady-mascot";
import { UserAvatar } from "@/components/app/user-avatar";
import { useSignedInViewer } from "@/components/viewer-provider";
import { CounselorDetailsDialog } from "@/components/student/counselor-details-dialog";
import { ReasonTile } from "@/components/student/reason-tile";
import { createClient } from "@/utils/supabase/client";
import { bookAppointment } from "@/lib/appointments/actions";
import { fetchAvailableSlots } from "@/lib/appointments/queries";
import { fetchCounselorsForDepartment } from "@/lib/counselors/queries";
import { fetchOrganization } from "@/lib/organization/queries";
import { fetchStudentDetails } from "@/lib/students/queries";
import {
  formatAppointmentDate,
  formatClockTime,
  formatSlotTime,
  toAppDateString,
} from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

export const APPOINTMENT_REASONS = [
  "Academic & Exam Panic",
  "Scholarship Retention",
  "Family & Career Pressure",
  "Severe Burnout & Insomnia",
  "Homesickness & Dorm Life",
  "Other Personal Concern",
] as const;

const REASON_TILES = [
  {
    value: "Academic & Exam Panic",
    icon: Library,
    title: "Academic & Exam Panic",
    description: "Assignment problems, lab anxiety, thesis deadline stress",
  },
  {
    value: "Scholarship Retention",
    icon: Award,
    title: "Scholarship Retention",
    description: "Fear of losing grade thresholds, appeals counseling",
  },
  {
    value: "Family & Career Pressure",
    icon: Users,
    title: "Family & Career Pressure",
    description: "Parental expectations, peer pressure, and lack of confidence",
  },
  {
    value: "Severe Burnout & Insomnia",
    icon: BatteryLow,
    title: "Severe Burnout & Insomnia",
    description: "Can't get out of bed, caffeine overload, sleep loss",
  },
  {
    value: "Homesickness & Dorm Life",
    icon: Home,
    title: "Homesickness & Dorm Life",
    description: "Provincial adjustment, dorm isolation, loneliness",
  },
  {
    value: "Other Personal Concern",
    icon: Sprout,
    title: "Other Personal Concern",
    description: "Relationships, general check-in, or grief",
  },
] as const;

const STEP_LABELS = ["Reason", "Date and Time", "Notes"] as const;
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const DURATIONS = ["30", "45", "60"] as const;

const OTHER = "Other Personal Concern";
const NOTES_MAX = 500;

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - firstDay - daysInMonth + 1;
    cells.push({ date: new Date(year, month + 1, nextDay), inMonth: false });
  }
  return cells;
}

function findNextAvailableDate(dayOfWeek: boolean[] | null | undefined): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!dayOfWeek || dayOfWeek.length < 7) return today;

  for (let offset = 0; offset < 30; offset++) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + offset);
    if (dayOfWeek[candidate.getDay()]) return candidate;
  }
  return today;
}

function ConsultationSummaryCard({
  counselorName,
  studentName,
  urgency,
  scheduledLabel,
  duration,
  officeRoom,
}: {
  counselorName: string;
  studentName: string;
  urgency: "low" | "high";
  scheduledLabel: string;
  duration: string;
  officeRoom: string;
}) {
  return (
    <div className="bg-card border-border shadow-steady-card overflow-hidden rounded-[20px] border text-left">
      {/* Top Bar */}
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3.5 text-[14px]">
        <span className="text-foreground font-medium">Onsite Consultation</span>
        <span
          className={cn(
            urgency === "high"
              ? "text-destructive font-medium"
              : "text-foreground/85",
          )}
        >
          {urgency === "high"
            ? "Urgent / Acute Distress (Need Fast Triage)"
            : "Standard Consultation (Upcoming Days)"}
        </span>
      </div>

      {/* Middle Gradient Banner matching Figma 564:2281 & 578:3054 */}
      <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#eff6ff] via-[#dbeafe]/70 to-[#bfdbfe]/55 px-5 py-7 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-950/50">
        {/* Top-left peeking blue mascot looking down-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-9 -left-6 hidden sm:block"
        >
          <SteadyMascot
            variant="orb"
            tone="blue"
            eyeAnchor="br"
            className="size-[152px]"
          />
        </div>
        {/* Bottom-right peeking emerald mascot looking up-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-4 -bottom-11 hidden sm:block"
        >
          <SteadyMascot
            variant="orb"
            tone="emerald"
            eyeAnchor="tl"
            className="size-[110px]"
          />
        </div>

        <div className="bg-card border-border shadow-steady-card relative z-10 flex w-full max-w-[440px] flex-wrap items-center justify-between gap-4 rounded-[18px] border px-6 py-4">
          <div className="min-w-0 text-left">
            <p className="text-muted-foreground text-xs">Counselor</p>
            <p className="text-foreground text-[15px] font-medium">
              {counselorName}
            </p>
          </div>
          <ArrowLeftRight
            aria-hidden
            strokeWidth={1.5}
            className="text-primary size-5 shrink-0"
          />
          <div className="min-w-0 text-right">
            <p className="text-muted-foreground text-xs">Student</p>
            <p className="text-foreground text-[15px] font-medium">
              {studentName}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom 4-Column Metadata Bar */}
      <div className="border-border grid grid-cols-2 gap-4 border-t px-5 py-4 text-[14px] sm:grid-cols-4">
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-xs">Scheduled At</p>
          <p className="text-foreground font-medium">{scheduledLabel}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-xs">Appointment Duration</p>
          <p className="text-foreground font-medium">{duration} mins</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-xs">Status</p>
          <p className="text-foreground font-medium">Pending Confirmation</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-xs">Location</p>
          <p className="text-foreground font-medium">{officeRoom}</p>
        </div>
      </div>
    </div>
  );
}

export default function BookingForm({
  defaultReason,
}: {
  defaultReason?: string;
}) {
  const viewer = useSignedInViewer();
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);
  const ids = { other: useId(), notes: useId() };

  const presetTile = REASON_TILES.find(
    (t) =>
      defaultReason &&
      (t.value.toLowerCase() === defaultReason.toLowerCase() ||
        t.title.toLowerCase().includes(defaultReason.toLowerCase())),
  );

  // 0 = Reason, 1 = Date and Time, 2 = Notes, 3 = Confirmation
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<string>(
    defaultReason ? (presetTile ? presetTile.value : OTHER) : "",
  );
  const [otherReason, setOtherReason] = useState(
    defaultReason && !presetTile ? defaultReason : "",
  );
  const [urgency, setUrgency] = useState<"low" | "high">("low");
  const [viewDate, setViewDate] = useState<Date | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState("");
  const [duration, setDuration] = useState<string>("45");
  const [notes, setNotes] = useState("");
  const [counselorDialogOpen, setCounselorDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
  const noCounselor = counselors.isSuccess && !counselor;

  const organization = useQuery({
    queryKey: queryKeys.organization,
    queryFn: () => fetchOrganization(supabase),
    enabled: noCounselor,
  });

  // Derive default available date & first open slot without setState-in-effect
  const effectiveDate = useMemo(
    () =>
      selectedDate ??
      (counselor ? findNextAvailableDate(counselor.day_of_week) : undefined),
    [selectedDate, counselor],
  );

  const effectiveViewDate = useMemo(
    () =>
      viewDate ??
      (effectiveDate
        ? new Date(effectiveDate.getFullYear(), effectiveDate.getMonth(), 1)
        : new Date()),
    [viewDate, effectiveDate],
  );

  const dayKey = effectiveDate ? format(effectiveDate, "yyyy-MM-dd") : "";
  const slotsQuery = useQuery({
    queryKey: queryKeys.availableSlots.day(counselor?.id ?? "", dayKey),
    queryFn: () => fetchAvailableSlots(supabase, counselor!.id!, dayKey),
    enabled: Boolean(counselor?.id && dayKey),
    staleTime: 30 * 1000,
  });

  const availableSlots = useMemo(
    () => (slotsQuery.data ?? []).map((s) => new Date(s).toISOString()),
    [slotsQuery.data],
  );

  const effectiveSlot =
    slot && availableSlots.includes(slot) ? slot : (availableSlots[0] ?? "");

  if (student.isLoading || counselors.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[92px] rounded-[20px]" />
        <Skeleton className="h-[597px] rounded-[20px]" />
      </div>
    );
  }

  if (student.isError || counselors.isError) {
    return (
      <ErrorState
        title="Booking Couldn't Be Loaded"
        description="Your details or your counselor couldn't be loaded. Check your connection and try again."
        onRetry={() => Promise.all([student.refetch(), counselors.refetch()])}
      />
    );
  }

  if (noCounselor || !counselor) {
    const org = organization.data;
    return (
      <EmptyState
        icon={UserRoundX}
        title="No Counselor Available Yet"
        description={
          <div className="space-y-3">
            <p>
              Please contact the guidance office and they&apos;ll help you
              directly.
            </p>
            {org && (
              <ul className="text-foreground space-y-2 text-left">
                <li className="flex gap-2">
                  <MapPin
                    aria-hidden
                    strokeWidth={1.5}
                    className="mt-0.5 size-4 shrink-0"
                  />{" "}
                  {org.office_location}
                </li>
                <li className="flex gap-2">
                  <Mail
                    aria-hidden
                    strokeWidth={1.5}
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <a
                    className="underline underline-offset-4"
                    href={`mailto:${org.email}`}
                  >
                    {org.email}
                  </a>
                </li>
                <li className="flex gap-2">
                  <Phone
                    aria-hidden
                    strokeWidth={1.5}
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <a
                    className="underline underline-offset-4"
                    href={`tel:${org.phone}`}
                  >
                    {org.phone}
                  </a>
                </li>
                <li className="flex gap-2">
                  <Clock
                    aria-hidden
                    strokeWidth={1.5}
                    className="mt-0.5 size-4 shrink-0"
                  />
                  {formatClockTime(org.start_office_hour)} –{" "}
                  {formatClockTime(org.end_office_hour)}
                </li>
              </ul>
            )}
          </div>
        }
      />
    );
  }

  const finalReason =
    reason === OTHER ? otherReason.trim() || "Other Personal Concern" : reason;
  const counselorName =
    `${counselor.first_name ?? ""} ${counselor.last_name ?? ""}`.trim() ||
    "Assigned Counselor";
  const studentName =
    `${student.data?.first_name ?? ""} ${student.data?.last_name ?? ""}`.trim() ||
    "Student";
  const officeRoom = "West Hall Room 204";
  const officeHours = `${formatClockTime(counselor.start_time)} – ${formatClockTime(counselor.end_time)}`;
  const availableWeekdays = (counselor.day_of_week ?? [])
    .map((open, idx) => (open ? idx : -1))
    .filter((idx) => idx >= 0);

  const todayKey = toAppDateString(new Date());
  const isDateDisabled = (date: Date) => {
    if (format(date, "yyyy-MM-dd") < todayKey) return true;
    const days = counselor.day_of_week;
    return !days || days.length < 7 || !days[date.getDay()];
  };

  const monthCells = getMonthGrid(
    effectiveViewDate.getFullYear(),
    effectiveViewDate.getMonth(),
  );
  const monthTitle = effectiveViewDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const selectedDateLabel = effectiveDate
    ? format(effectiveDate, "MMMM d, yyyy")
    : "Select a Date";

  const scheduledSummaryLabel = effectiveSlot
    ? formatAppointmentDate(effectiveSlot)
    : effectiveDate
      ? format(effectiveDate, "MMMM d, yyyy")
      : "Not Selected";

  const canAdvanceStep0 = Boolean(finalReason);
  const canAdvanceStep1 = Boolean(effectiveSlot);

  const shiftMonth = (delta: number) => {
    setViewDate(
      new Date(
        effectiveViewDate.getFullYear(),
        effectiveViewDate.getMonth() + delta,
        1,
      ),
    );
  };

  const submit = () => {
    setError(null);
    if (!finalReason) return setError("Choose a reason for your visit.");
    if (!effectiveSlot)
      return setError("Pick an available date and time slot.");

    startTransition(async () => {
      const result = await bookAppointment({
        counselor_id: counselor.id!,
        scheduled_at: effectiveSlot,
        reason: finalReason,
        notes,
        urgency,
        duration_minutes: Number(duration),
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.availableSlots.all,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        setSlot("");
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
      toast.success(`Consultation request sent to ${counselorName}.`);
      setStep(3);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Assigned Counselor Bar (Figma 678:19533) */}
      <div className="bg-card border-border shadow-steady-card flex flex-wrap items-center justify-between gap-5 rounded-[20px] border p-5">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={counselorName}
              src={counselor.avatar}
              className="size-[51px] shrink-0 rounded-[10px]"
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

      {/* Appointment Process Card (Figma 564:2137) */}
      {step === 3 ? (
        /* Variant 4: Confirmation (Figma 578:3054) */
        <div className="bg-steady-dot-grid border-border shadow-steady-card flex min-h-[597px] flex-col items-center justify-center gap-7 rounded-[20px] border p-6 text-center sm:p-10">
          <div className="max-w-xl space-y-1.5">
            <h2 className="text-foreground text-[20px] leading-tight font-medium tracking-tight sm:text-[22px]">
              Consultation Request Sent to {counselorName}!
            </h2>
            <p className="text-muted-foreground text-[15px]">
              They will review and confirm shortly.
            </p>
          </div>

          <div className="w-full max-w-[680px]">
            <ConsultationSummaryCard
              counselorName={counselorName}
              studentName={studentName}
              urgency={urgency}
              scheduledLabel={scheduledSummaryLabel}
              duration={duration}
              officeRoom={officeRoom}
            />
          </div>

          <Button asChild variant="outline" className="px-6">
            <Link href="/student/appointments">
              View Recently Created Request
            </Link>
          </Button>
        </div>
      ) : (
        /* Variants 1–3: 2-Column Split Wizard (Left Dot-Grid Stepper Rail + Right Content) */
        <div className="bg-card border-border shadow-steady-card grid min-h-[597px] overflow-hidden rounded-[20px] border lg:grid-cols-[230px_1fr]">
          {/* Left Vertical Stepper Rail spanning full height like Figma 564:2137 */}
          <aside
            aria-label="Booking progress"
            className="bg-steady-dot-grid border-border relative flex flex-row items-center justify-between gap-3 border-b p-5 lg:flex-col lg:items-start lg:justify-between lg:border-r lg:border-b-0 lg:px-8 lg:py-10"
          >
            {STEP_LABELS.map((label, idx) => {
              const isCompleted = idx < step;
              const isActive = idx === step;
              const isClickable = idx <= step;

              return (
                <div
                  key={label}
                  className={cn(
                    "relative flex items-center lg:w-full",
                    idx < STEP_LABELS.length - 1 &&
                      "lg:flex-1 lg:flex-col lg:items-start",
                  )}
                >
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => {
                      if (isClickable) {
                        setStep(idx);
                        setError(null);
                      }
                    }}
                    className={cn(
                      "relative z-10 flex items-center gap-3.5 text-left transition-opacity",
                      isClickable ? "cursor-pointer" : "cursor-default",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-[38px] shrink-0 items-center justify-center rounded-full transition-all",
                        isCompleted &&
                          "bg-primary text-primary-foreground shadow-steady-pill",
                        isActive &&
                          "bg-primary text-primary-foreground shadow-steady-pill",
                        !isCompleted &&
                          !isActive &&
                          "bg-slate-500/85 text-white shadow-sm dark:bg-slate-600",
                      )}
                    >
                      {isActive ? (
                        <span className="flex size-[24px] items-center justify-center rounded-full border border-dashed border-white/85">
                          <Check strokeWidth={2} className="size-3.5" />
                        </span>
                      ) : isCompleted ? (
                        <Check strokeWidth={2} className="size-4" />
                      ) : idx === 1 ? (
                        <Check
                          strokeWidth={1.75}
                          className="size-4 opacity-90"
                        />
                      ) : (
                        <span className="size-3 rounded-full border-[1.5px] border-white/85" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-[14px] font-medium sm:text-[15px]",
                        isCompleted || isActive
                          ? "text-foreground"
                          : "text-foreground/80",
                      )}
                    >
                      {label}
                    </span>
                  </button>

                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      aria-hidden
                      className={cn(
                        "ml-[18.5px] hidden w-px flex-1 transition-colors lg:block",
                        idx < step ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </aside>

          {/* Right Step Panel */}
          <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
            {/* Step 1: Reason (Figma 564:2136) */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-foreground text-[18px] leading-tight font-medium tracking-tight sm:text-[20px]">
                    What&apos;s On Your Mind?
                  </h2>
                  <p className="text-muted-foreground text-[15px]">
                    Pick the area that best describes what you are going
                    through. There are no wrong answers.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {REASON_TILES.map((tile) => (
                    <ReasonTile
                      key={tile.value}
                      icon={tile.icon}
                      title={tile.title}
                      description={tile.description}
                      selected={reason === tile.value}
                      onClick={() => {
                        setReason(tile.value);
                        setError(null);
                      }}
                    />
                  ))}
                </div>

                {reason === OTHER && (
                  <div className="space-y-2">
                    <label htmlFor={ids.other} className="text-sm font-medium">
                      Describe Your Concern Briefly (Optional)
                    </label>
                    <Input
                      id={ids.other}
                      value={otherReason}
                      maxLength={120}
                      onChange={(event) => setOtherReason(event.target.value)}
                      placeholder="Optional — e.g. relationships, general check-in, or grief"
                    />
                  </div>
                )}

                {/* Consultation Urgency Level Box */}
                <div className="bg-card border-border space-y-3 rounded-[20px] border p-5">
                  <p className="text-foreground text-[15px] font-medium">
                    Consultation Urgency Level
                  </p>
                  <div
                    role="radiogroup"
                    aria-label="Consultation Urgency Level"
                    className="flex flex-wrap items-center gap-x-8 gap-y-3"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={urgency === "low"}
                      onClick={() => setUrgency("low")}
                      className="flex cursor-pointer items-center gap-2.5 text-left text-[14px]"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                          urgency === "low"
                            ? "border-primary border-[5px]"
                            : "border-border bg-card",
                        )}
                      />
                      <span
                        className={cn(
                          urgency === "low"
                            ? "text-foreground font-medium"
                            : "text-foreground/80",
                        )}
                      >
                        Standard Consultation (Upcoming Days)
                      </span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={urgency === "high"}
                      onClick={() => setUrgency("high")}
                      className="flex cursor-pointer items-center gap-2.5 text-left text-[14px]"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                          urgency === "high"
                            ? "border-destructive border-[5px]"
                            : "border-destructive/50 bg-destructive/10",
                        )}
                      />
                      <span
                        className={cn(
                          "text-destructive",
                          urgency === "high" && "font-medium",
                        )}
                      >
                        Urgent / Acute Distress (Need Fast Triage)
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date and Time (Figma 564:2138) */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-foreground text-[18px] leading-tight font-medium tracking-tight sm:text-[20px]">
                    Pick an Open Slot with {counselorName}
                  </h2>
                  <p className="text-muted-foreground text-[15px]">
                    Slots reflect real-time counselor working hours.
                    Consultation length is {duration} minutes.
                  </p>
                </div>

                {/* Centered Calendar + Details container matching Figma 564:2138 */}
                <div className="border-border flex items-center justify-center rounded-[20px] border px-4 py-7 sm:px-8 sm:py-9">
                  <div className="flex w-full max-w-[540px] flex-col items-stretch justify-center gap-5 md:flex-row">
                    {/* Month Calendar Card */}
                    <div className="bg-card border-border shadow-steady-card flex flex-1 flex-col justify-between gap-3 rounded-[20px] border p-4">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          aria-label="Previous month"
                          onClick={() => shiftMonth(-1)}
                          className="border-border hover:bg-muted flex size-10 cursor-pointer items-center justify-center rounded-full border transition-colors"
                        >
                          <ChevronLeft strokeWidth={1.5} className="size-4" />
                        </button>
                        <span className="text-foreground text-[15px] font-medium">
                          {monthTitle}
                        </span>
                        <button
                          type="button"
                          aria-label="Next month"
                          onClick={() => shiftMonth(1)}
                          className="border-border hover:bg-muted flex size-10 cursor-pointer items-center justify-center rounded-full border transition-colors"
                        >
                          <ChevronRight strokeWidth={1.5} className="size-4" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-muted-foreground grid grid-cols-7 text-center text-[13px]">
                          {WEEKDAYS.map((d) => (
                            <span key={d}>{d}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-1">
                          {monthCells.map(({ date, inMonth }) => {
                            const disabled = isDateDisabled(date);
                            const isSelected =
                              effectiveDate?.toDateString() ===
                              date.toDateString();

                            return (
                              <button
                                key={date.toISOString()}
                                type="button"
                                disabled={disabled}
                                onClick={() => {
                                  setSelectedDate(date);
                                  setSlot("");
                                  setError(null);
                                }}
                                className={cn(
                                  "mx-auto flex size-9 items-center justify-center rounded-[10px] text-[14px] transition-colors",
                                  isSelected &&
                                    "bg-primary text-primary-foreground shadow-steady-pill font-medium",
                                  !isSelected &&
                                    !disabled &&
                                    inMonth &&
                                    "text-foreground hover:bg-muted cursor-pointer",
                                  !isSelected &&
                                    !disabled &&
                                    !inMonth &&
                                    "text-muted-foreground/60 hover:bg-muted/60 cursor-pointer",
                                  disabled &&
                                    "text-muted-foreground/30 cursor-not-allowed",
                                )}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Appointment Details Card */}
                    <div className="bg-card border-border shadow-steady-card flex w-full flex-col justify-between gap-4 rounded-[20px] border p-5 text-left md:w-[235px] md:shrink-0">
                      <div className="space-y-1">
                        <p className="text-foreground text-[14px] font-medium">
                          Appointment Date
                        </p>
                        <p className="text-foreground/85 text-[15px]">
                          {selectedDateLabel}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-foreground block text-[14px] font-medium">
                          Appointment Time
                        </span>
                        {slotsQuery.isLoading ? (
                          <Skeleton className="h-12 w-full rounded-[25px]" />
                        ) : availableSlots.length === 0 ? (
                          <div className="border-border text-muted-foreground flex h-12 items-center rounded-[25px] border px-4 text-[14px]">
                            No Open Slots
                          </div>
                        ) : (
                          <Select
                            value={effectiveSlot}
                            onValueChange={(val) => {
                              setSlot(val);
                              setError(null);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Available Times</SelectLabel>
                                {availableSlots.map((iso) => (
                                  <SelectItem key={iso} value={iso}>
                                    {formatSlotTime(iso)}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-foreground block text-[14px] font-medium">
                          Appointment Duration
                        </span>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Duration</SelectLabel>
                              {DURATIONS.map((mins) => (
                                <SelectItem key={mins} value={mins}>
                                  {mins} mins
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <p className="text-foreground/80 text-[14px] leading-snug">
                        These details can be changed later.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Notes & Consultation Summary (Figma 564:2281) */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-foreground text-[18px] leading-tight font-medium tracking-tight sm:text-[20px]">
                    Safe Space &amp; Private Context
                  </h2>
                  <p className="text-muted-foreground text-[15px]">
                    Anything you&apos;d like {counselorName} to know before you
                    sit down together? Only your counselor sees this.
                  </p>
                </div>

                <div>
                  <label htmlFor={ids.notes} className="sr-only">
                    Private Context for Counselor
                  </label>
                  <Textarea
                    id={ids.notes}
                    value={notes}
                    maxLength={NOTES_MAX}
                    rows={2}
                    placeholder="Optional. Share any context you want your counselor to know."
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-[72px] rounded-[20px] px-5 py-4 text-[15px]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <h3 className="text-foreground text-[18px] leading-tight font-medium">
                      Consultation Summary
                    </h3>
                    <p className="text-muted-foreground text-[14px]">
                      Ensure these details are accurate before proceeding
                    </p>
                  </div>
                  <ConsultationSummaryCard
                    counselorName={counselorName}
                    studentName={studentName}
                    urgency={urgency}
                    scheduledLabel={scheduledSummaryLabel}
                    duration={duration}
                    officeRoom={officeRoom}
                  />
                </div>
              </div>
            )}

            {/* Step Footer Row (no top border, matching Figma 564:2137) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p
                className="text-muted-foreground text-[14px]"
                aria-live="polite"
              >
                {error ? (
                  <span className="text-destructive font-medium">{error}</span>
                ) : (
                  `Step ${step + 1} of 3`
                )}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep((s) => Math.max(0, s - 1));
                      setError(null);
                    }}
                  >
                    <ArrowLeft strokeWidth={1.5} className="size-4" />
                    Back
                  </Button>
                )}

                {step === 0 && (
                  <Button
                    type="button"
                    disabled={!canAdvanceStep0}
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                  >
                    Continue to Date and Time
                    <ArrowRight strokeWidth={1.5} className="size-4" />
                  </Button>
                )}

                {step === 1 && (
                  <Button
                    type="button"
                    disabled={!canAdvanceStep1}
                    onClick={() => {
                      setStep(2);
                      setError(null);
                    }}
                  >
                    Continue to Note
                    <ArrowRight strokeWidth={1.5} className="size-4" />
                  </Button>
                )}

                {step === 2 && (
                  <Button type="button" loading={isPending} onClick={submit}>
                    Submit Consultation Request
                    <Check strokeWidth={1.5} className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
