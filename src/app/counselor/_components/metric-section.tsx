"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/app/section-card";
import { useSignedInViewer } from "@/components/viewer-provider";
import { createClient } from "@/utils/supabase/client";
import { fetchCounselorAppointmentCounts } from "@/lib/appointments/queries";
import { queryKeys } from "@/lib/query-keys";

/**
 * Appointment counts. The key sits under appointments.all, so any appointment
 * change (including one arriving over Realtime) refreshes these too. They used to
 * go stale until a full reload.
 */
export default function MetricSection() {
  const viewer = useSignedInViewer();
  const supabase = useMemo(() => createClient(), []);

  const counts = useQuery({
    queryKey: queryKeys.appointments.counselorCounts(viewer.profileId),
    queryFn: () => fetchCounselorAppointmentCounts(supabase, viewer.profileId),
  });

  const items = [
    { label: "Waiting for you", value: counts.data?.pending },
    { label: "Upcoming", value: counts.data?.approved },
    { label: "Completed", value: counts.data?.completed },
    { label: "All time", value: counts.data?.total },
  ];

  return (
    <SectionCard
      title="At a glance"
      description={counts.isError ? "Counts couldn't be loaded." : undefined}
      actions={
        counts.isError && (
          <Button
            variant="outline"
            size="sm"
            loading={counts.isFetching}
            onClick={() => void counts.refetch()}
          >
            Try again
          </Button>
        )
      }
    >
      <dl className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border p-4">
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 text-3xl tracking-tight tabular-nums">
              {counts.isLoading ? (
                <Skeleton className="h-9 w-12" />
              ) : counts.isError ? (
                <span
                  className="text-muted-foreground"
                  aria-label="Unavailable"
                >
                  –
                </span>
              ) : (
                (item.value ?? 0)
              )}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}
