import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/types/supabase";
import { ArrowUpRight } from "lucide-react";

export default function CounselorAppointmentTile({
  appointment,
  isLoading,
}: {
  appointment?: Tables<"appointment_with_details">;
  isLoading: boolean;
}) {
  if (isLoading)
    return (
      <div className="flex flex-col gap-4 rounded-2xl border-1 p-6">
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex flex-1 items-start justify-end">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    );

  if (!appointment) return;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-1 p-6">
      <div className="flex gap-4">
        <div className="from-brand-light to-brand-normal h-10 w-10 rounded-full bg-gradient-to-t" />
        <div>
          <p className="font-medium">Name of Student</p>
          <p>
            {appointment.first_student_name +
              " " +
              appointment.last_student_name}
          </p>
        </div>
        <div className="flex flex-1 items-start justify-end">
          <ArrowUpRight
            className="rounded-full border-1 border-gray-200 p-2"
            size={40}
            strokeWidth={1.25}
          />
        </div>
      </div>
      <div className="flex">
        <div className="flex-1">
          <p className="font-medium">Scheduled At</p>
          <p>
            {appointment.scheduled_at
              ? new Date(appointment.scheduled_at).toLocaleString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "No schedule"}
          </p>
        </div>
        <div className="flex-1">
          <p className="font-medium">Reason</p>
          <p>{appointment.reason}</p>
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button variant="outline">Reschedule</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  );
}
