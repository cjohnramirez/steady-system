"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/app/empty-state";
import { PaginationControls } from "@/components/app/pagination-controls";
import { SearchInput } from "@/components/app/search-input";
import { SectionCard } from "@/components/app/section-card";
import { useSignedInViewer } from "@/components/viewer-provider";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import { fetchCounselorAppointments } from "@/lib/appointments/queries";
import {
  APPOINTMENT_STATUSES,
  appointmentStatusLabel,
  type AppointmentStatus,
} from "@/lib/appointments/status";
import { queryKeys } from "@/lib/query-keys";
import AppointmentCard from "./appointment-card";

const PAGE_SIZE = 5;
const ALL = "all";

/**
 * The counselor's appointments. Defaults to the requests waiting on them, which is
 * where Accept and Decline live; the old default was "approved", which hid every
 * pending request until the filter was changed, and there was no "All".
 */
export default function AppointmentList() {
  const viewer = useSignedInViewer();
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<AppointmentStatus | typeof ALL>(
    "pending",
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const params = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    status: status === ALL ? undefined : status,
    sort: {
      id: "scheduled_at",
      desc: status !== "pending" && status !== "approved",
    },
  };

  const appointments = useQuery({
    queryKey: queryKeys.appointments.forCounselor(viewer.profileId, params),
    queryFn: () =>
      fetchCounselorAppointments(supabase, viewer.profileId, params),
    placeholderData: keepPreviousData,
  });

  const rows = appointments.data?.data ?? [];

  return (
    <SectionCard
      title="Appointments"
      description="Newest requests first. Upcoming sessions are sorted by date."
      actions={
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as AppointmentStatus | typeof ALL);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {APPOINTMENT_STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {appointmentStatusLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <SearchInput
        label="Search by student or reason"
        value={search}
        onValueChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        className="sm:max-w-none"
      />

      <div className="flex flex-col gap-3" aria-busy={appointments.isFetching}>
        {appointments.isLoading ? (
          Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-36 rounded-xl" />
          ))
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title={
              status === "pending"
                ? "No requests waiting"
                : "No appointments found"
            }
            description={
              debouncedSearch
                ? "Try a different search."
                : "New requests will appear here as students book."
            }
          />
        ) : (
          rows.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        )}
      </div>

      <PaginationControls
        page={page}
        pageSize={PAGE_SIZE}
        total={appointments.data?.count ?? 0}
        onPageChange={setPage}
        isLoading={appointments.isFetching}
        itemLabel="appointments"
      />
    </SectionCard>
  );
}
