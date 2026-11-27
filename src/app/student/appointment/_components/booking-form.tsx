"use client";

import { useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  Clock,
  Compass,
  GraduationCap,
  HeartHandshake,
  Mail,
  MapPin,
  MessageSquarePlus,
  Phone,
  Sparkles,
  UserRoundX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { SectionCard } from "@/components/app/section-card";
import { Stepper } from "@/components/app/stepper";
import { UserAvatar } from "@/components/app/user-avatar";
import { useSignedInViewer } from "@/components/viewer-provider";
import { SlotPicker } from "@/components/appointments/slot-picker";
import { ReasonTile } from "@/components/student/reason-tile";
import { CounselorDetailsDialog } from "@/components/student/counselor-details-dialog";
import { createClient } from "@/utils/supabase/client";
import { bookAppointment } from "@/lib/appointments/actions";
import { fetchCounselorsForDepartment } from "@/lib/counselors/queries";
import { fetchOrganization } from "@/lib/organization/queries";
import { fetchStudentDetails } from "@/lib/students/queries";
import { formatAppointmentDate, formatClockTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export const APPOINTMENT_REASONS = [
  "Academic",
  "Career",
  "Personal",
  "Mental health",
  "Family",
  "Peer relationships",
  "Adjustment",
  "Stress",
  "Grief",
  "Referral",
] as const;

const REASON_TILES = [
  {
    value: "Academic",
    icon: GraduationCap,
    title: "Academic & Exam Panic",
    description: "Assignment problems, lab anxiety, thesis deadline stress",
  },
  {
    value: "Mental health",
    icon: Brain,
    title: "Burnout & Sleep Debt",
    description: "Chronic exhaustion, trouble focusing, emotional fatigue",
  },
  {
    value: "Family",
    icon: HeartHandshake,
    title: "Family & Relationships",
    description: "Family expectations, peer conflicts, feeling isolated",
  },
  {
    value: "Career",
    icon: Compass,
    title: "Career & Life Direction",
    description: "Course doubts, shifting majors, internship pressure",
  },
  {
    value: "Stress",
    icon: Sparkles,
    title: "Personal & Adjustment",
    description: "Transition stress, confidence, daily coping strategies",
  },
  {
    value: "__other__",
    icon: MessageSquarePlus,
    title: "Something Else",
    description: "Describe another topic you want to talk through",
  },
] as const;

const WIZARD_STEPS = [
  { id: "reason", label: "Topic" },
  { id: "schedule", label: "Date & Time" },
  { id: "notes", label: "Notes" },
  { id: "confirm", label: "Review" },
] as const;

const OTHER = "__other__";
const NOTES_MAX = 500;

export default function BookingForm({
  defaultReason,
}: {
  defaultReason?: string;
}) {
  const viewer = useSignedInViewer();
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);
  const ids = { other: useId(), notes: useId() };

  const presetIsKnown = APPOINTMENT_REASONS.some((r) => r === defaultReason);
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<string>(
    defaultReason ? (presetIsKnown ? defaultReason : OTHER) : "",
  );
  const [otherReason, setOtherReason] = useState(
    defaultReason && !presetIsKnown ? defaultReason : "",
  );
  const [slot, setSlot] = useState("");
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

  if (student.isLoading || counselors.isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (student.isError || counselors.isError) {
    return (
      <ErrorState
        title="Booking couldn't be loaded"
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
        title="No counselor is available for your department yet"
        description={
          <div className="space-y-3">
            <p>
              Please contact the guidance office and they&apos;ll help you
              directly.
            </p>
            {org && (
              <ul className="text-foreground space-y-2 text-left">
                <li className="flex gap-2">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />{" "}
                  {org.office_location}
                </li>
                <li className="flex gap-2">
                  <Mail aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <a
                    className="underline underline-offset-4"
                    href={`mailto:${org.email}`}
                  >
                    {org.email}
                  </a>
                </li>
                <li className="flex gap-2">
                  <Phone aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <a
                    className="underline underline-offset-4"
                    href={`tel:${org.phone}`}
                  >
                    {org.phone}
                  </a>
                </li>
                <li className="flex gap-2">
                  <Clock aria-hidden className="mt-0.5 size-4 shrink-0" />
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

  const finalReason = reason === OTHER ? otherReason.trim() : reason;
  const counselorName =
    `${counselor.first_name ?? ""} ${counselor.last_name ?? ""}`.trim();
  const officeHours = `${formatClockTime(counselor.start_time)} – ${formatClockTime(counselor.end_time)}`;
  const availableWeekdays = (counselor.day_of_week ?? [])
    .map((open, idx) => (open ? idx : -1))
    .filter((idx) => idx >= 0);

  const canAdvance =
    (step === 0 && Boolean(finalReason)) ||
    (step === 1 && Boolean(slot)) ||
    step === 2;

  const submit = () => {
    setError(null);
    if (!finalReason) return setError("Choose a reason for your visit.");
    if (!slot) return setError("Pick a day and a time slot.");

    startTransition(async () => {
      const result = await bookAppointment({
        counselor_id: counselor.id!,
        scheduled_at: slot,
        reason: finalReason,
        notes,
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
      toast.success(
        `Requested for ${formatAppointmentDate(slot)}. We'll let you know once it's confirmed.`,
      );
      router.push("/student");
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Assigned Counselor Summary Bar with Details Trigger */}
      <div className="bg-card border-border shadow-steady-card flex flex-wrap items-center justify-between gap-4 rounded-[20px] border p-5">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={counselorName}
            src={counselor.avatar}
            className="size-[51px] rounded-[12px]"
          />
          <div className="min-w-0">
            <p className="font-medium">{counselorName}</p>
            <p className="text-muted-foreground text-sm">
              {student.data?.department} • {officeHours}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCounselorDialogOpen(true)}
        >
          View Counselor Details
        </Button>
      </div>

      {/* 4-Step Booking Wizard */}
      <Stepper
        steps={WIZARD_STEPS}
        currentIndex={step}
        onStepSelect={(next) => {
          if (next <= step) setStep(next);
        }}
      >
        {step === 0 && (
          <SectionCard
            title="What would you like to talk about?"
            description="Choose the topic that feels closest to what you're navigating."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="space-y-2 pt-2">
                <label htmlFor={ids.other} className="text-sm font-medium">
                  Describe it briefly
                </label>
                <Input
                  id={ids.other}
                  value={otherReason}
                  maxLength={120}
                  onChange={(event) => setOtherReason(event.target.value)}
                  placeholder="For example: trouble sleeping before exams"
                />
              </div>
            )}
          </SectionCard>
        )}

        {step === 1 && (
          <SectionCard
            title="Pick a date and time"
            description="Only open slots from your counselor's schedule are shown. Sessions are 30 minutes."
          >
            <SlotPicker
              counselor={{
                id: counselor.id!,
                day_of_week: counselor.day_of_week,
              }}
              value={slot}
              onChange={(val) => {
                setSlot(val);
                setError(null);
              }}
            />
          </SectionCard>
        )}

        {step === 2 && (
          <SectionCard
            title="Anything your counselor should know?"
            description="Optional — share any context that helps your counselor prepare."
          >
            <div className="space-y-2">
              <label htmlFor={ids.notes} className="sr-only">
                Notes for counselor
              </label>
              <Textarea
                id={ids.notes}
                value={notes}
                maxLength={NOTES_MAX}
                rows={5}
                placeholder="Write a brief note (optional)..."
                onChange={(event) => setNotes(event.target.value)}
                className="rounded-[20px]"
              />
              <p className="text-muted-foreground text-xs" aria-live="polite">
                {NOTES_MAX - notes.length} characters left
              </p>
            </div>
          </SectionCard>
        )}

        {step === 3 && (
          <SectionCard
            title="Review your request"
            description="Confirm the details below before sending your request."
          >
            <div className="bg-muted/50 border-border space-y-3 rounded-[18px] border p-5 text-[15px]">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-muted-foreground">Counselor</span>
                <span className="font-medium">{counselorName}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-muted-foreground">Topic</span>
                <span className="font-medium">{finalReason}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-muted-foreground">Scheduled Slot</span>
                <span className="font-medium">
                  {slot ? formatAppointmentDate(slot) : "Not selected"}
                </span>
              </div>
              {notes.trim() && (
                <div className="border-border border-t pt-3">
                  <p className="text-muted-foreground text-xs">Your note</p>
                  <p className="mt-1 text-sm">{notes.trim()}</p>
                </div>
              )}
            </div>
          </SectionCard>
        )}
      </Stepper>

      {/* Wizard Navigation Bar */}
      <div className="bg-card border-border shadow-steady-card sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border px-5 py-4">
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            `Step ${step + 1} of ${WIZARD_STEPS.length}: ${WIZARD_STEPS[step].label}`
          )}
        </p>

        <div className="flex items-center gap-2.5">
          {step === 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/student")}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
          )}

          {step < WIZARD_STEPS.length - 1 ? (
            <Button
              type="button"
              disabled={!canAdvance}
              onClick={() =>
                setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1))
              }
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="positive"
              loading={isPending}
              onClick={submit}
            >
              Request Appointment
            </Button>
          )}
        </div>
      </div>

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
          officeHours,
          availableWeekdays,
        }}
      />
    </div>
  );
}
