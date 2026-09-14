"use client";

import { useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Mail, MapPin, Phone, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EmptyState } from "@/components/app/empty-state";
import { SectionCard } from "@/components/app/section-card";
import { UserAvatar } from "@/components/app/user-avatar";
import { useSignedInViewer } from "@/components/viewer-provider";
import { SlotPicker } from "@/components/appointments/slot-picker";
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

const OTHER = "__other__";
const NOTES_MAX = 500;

/**
 * Booking, fixed from the old page: it submitted with no slot chosen (sending local
 * midnight, which the database refused with a generic message), kept the button
 * enabled while saving, never refreshed the slot list, and its Cancel did nothing.
 */
export default function BookingForm({
  defaultReason,
}: {
  defaultReason?: string;
}) {
  const viewer = useSignedInViewer();
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);
  const ids = { reason: useId(), other: useId(), notes: useId() };

  const presetIsKnown = APPOINTMENT_REASONS.some((r) => r === defaultReason);
  const [reason, setReason] = useState<string>(
    defaultReason ? (presetIsKnown ? defaultReason : OTHER) : "",
  );
  const [otherReason, setOtherReason] = useState(
    defaultReason && !presetIsKnown ? defaultReason : "",
  );
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
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

      // Whatever happened, the slots on screen may be out of date now.
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

  const counselorName =
    `${counselor.first_name ?? ""} ${counselor.last_name ?? ""}`.trim();

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-6"
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-6">
          <SectionCard title="Your counselor">
            <div className="flex items-center gap-4">
              <UserAvatar
                name={counselorName}
                src={counselor.avatar}
                size="md"
              />
              <div className="min-w-0">
                <p className="font-medium">{counselorName}</p>
                <p className="text-muted-foreground">
                  {student.data?.department}
                </p>
                <p className="text-muted-foreground">
                  {formatClockTime(counselor.start_time)} –{" "}
                  {formatClockTime(counselor.end_time)}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={
              <span id={ids.reason}>What would you like to talk about?</span>
            }
          >
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              value={reason}
              onValueChange={(value) => value && setReason(value)}
              aria-labelledby={ids.reason}
              className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
            >
              {[...APPOINTMENT_REASONS, OTHER].map((option) => (
                <ToggleGroupItem
                  key={option}
                  value={option}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {option === OTHER ? "Something else" : option}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {reason === OTHER && (
              <div className="space-y-2">
                <label htmlFor={ids.other} className="font-medium">
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
            <div className="space-y-2">
              <label htmlFor={ids.notes} className="font-medium">
                Anything your counselor should know?{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                id={ids.notes}
                value={notes}
                maxLength={NOTES_MAX}
                rows={4}
                onChange={(event) => setNotes(event.target.value)}
              />
              <p className="text-muted-foreground text-xs" aria-live="polite">
                {NOTES_MAX - notes.length} characters left
              </p>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Pick a time"
          description="Only times your counselor still has free are shown. Sessions are 30 minutes."
        >
          <SlotPicker
            counselor={{
              id: counselor.id!,
              day_of_week: counselor.day_of_week,
            }}
            value={slot}
            onChange={setSlot}
          />
        </SectionCard>
      </div>

      <div className="bg-card sticky bottom-0 -mx-4 flex flex-col gap-3 border-t px-4 py-4 sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:border">
        <p className="text-muted-foreground" aria-live="polite">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : slot ? (
            <>
              Requesting{" "}
              <span className="text-foreground font-medium">
                {formatAppointmentDate(slot)}
              </span>
            </>
          ) : (
            "Choose a reason and a time to continue."
          )}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/student")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner />}
            Request appointment
          </Button>
        </div>
      </div>
    </form>
  );
}
