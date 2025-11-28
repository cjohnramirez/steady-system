"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, User } from "lucide-react";

export default function CounselorSection({
  appointmentDepartmentName,
  appointmentCounselorName,
  isLoading,
}: {
  appointmentDepartmentName: string;
  appointmentCounselorName: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="h-fit space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-8">
          <div className="w-fit">
            <Skeleton className="h-30 w-30 rounded-full" />
          </div>
          <div className="flex w-full gap-6">
            <div className="w-1/2 space-y-2 rounded-2xl border p-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="w-1/2 space-y-2 rounded-2xl border p-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-fit space-y-6 rounded-2xl border border-gray-200 bg-white p-8">
      <p className="font-medium">Your Counselor</p>
      <div className="flex items-center gap-8">
        <div className="w-fit">
          <div className="from-brand-light to-brand-normal h-30 w-30 rounded-full bg-gradient-to-t" />
        </div>
        <div className="flex w-full gap-6">
          <div className="w-1/2 rounded-2xl border p-4">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border p-2">
              <BookOpen strokeWidth={1.25} size={24} />
            </div>
            <p className="font-medium">Department Name</p>
            <p>{appointmentDepartmentName}</p>
          </div>
          <div className="w-1/2 rounded-2xl border p-4">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border p-2">
              <User strokeWidth={1} size={40} />
            </div>
            <p className="font-medium">Counselor Name</p>
            <p>{appointmentCounselorName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
