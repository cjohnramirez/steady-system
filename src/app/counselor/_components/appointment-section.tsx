// fetch all appointments for the counselor

// ability to reschedule and cancel appointments

// ability to paginate

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tables } from "@/types/supabase";
import CounselorAppointmentTile from "./appointment-tile";
import { PaginationState } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, CircleOff, Search } from "lucide-react";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  APPOINTMENT_STATUSES,
  appointmentStatusDot,
  appointmentStatusLabel,
  type AppointmentStatus,
} from "@/lib/appointments/status";

export default function CounselorAppointmentSection({
  status,
  setStatus,
  appointments,
  pagination,
  setPagination,
  count,
  setSearch,
  isLoading,
}: {
  status: AppointmentStatus | "";
  setStatus: (status: AppointmentStatus) => void;
  appointments: Tables<"appointment_with_details">[];
  pagination: PaginationState;
  setPagination: (paginationProps: PaginationState) => void;
  count: number;
  setSearch: (search: string) => void;
  isLoading: boolean;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8">
      <div className="flex items-center justify-between">
        <p className="font-medium">Appointments</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <div
                className={`h-2 w-2 rounded-full ${appointmentStatusDot(status)}`}
              />
              <p>{appointmentStatusLabel(status)}</p>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {APPOINTMENT_STATUSES.map((option) => (
              <DropdownMenuItem key={option} onClick={() => setStatus(option)}>
                <div
                  className={`h-2 w-2 rounded-full ${appointmentStatusDot(option)}`}
                />
                <p>{appointmentStatusLabel(option)}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <InputGroup className="w-full bg-white px-2">
        <Search strokeWidth={1.25} />
        <InputGroupInput
          placeholder="Search by student's last name"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />
      </InputGroup>
      <div className="flex flex-1 flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, idx) => (
              <CounselorAppointmentTile key={idx} isLoading={isLoading} />
            ))}
          </div>
        ) : appointments.length !== 0 ? (
          appointments.map((appointment, idx) => (
            <CounselorAppointmentTile
              appointment={appointment}
              key={idx}
              isLoading={isLoading}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center gap-4 rounded-2xl border">
            <CircleOff strokeWidth={1.25} />
            <p>No appointments found</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p>
          Showing {appointments.length} of {count} result(s)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.pageIndex === 0}
            onClick={() =>
              setPagination({
                ...pagination,
                pageIndex: Math.max(pagination.pageIndex - 1, 0),
              })
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            disabled={appointments.length < pagination.pageSize}
            onClick={() =>
              setPagination({
                ...pagination,
                pageIndex: pagination.pageIndex + 1,
              })
            }
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
