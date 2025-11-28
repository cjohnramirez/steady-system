"use client";

import { fetchStudent } from "@/app/admin/appointments/@modal/actions";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/auth-store";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, ArrowUpRight, Edit2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import StudentProfileModal from "./profile-modal";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSection() {
  const getStudentID = useUserStore.getState().id;
  const [open, setOpen] = useState(false);

  const { data: studentData, isLoading } = useQuery({
    queryKey: ["student-user"],
    queryFn: () => fetchStudent(getStudentID),
  });

  return (
    <>
      {open && (
        <StudentProfileModal open={open} setOpen={setOpen} id={getStudentID} />
      )}

      <div className="grid grid-cols-2 grid-rows-3 gap-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="col-span-2 m-0 flex items-center gap-5 rounded-2xl border border-gray-200 p-5">
          <div className="text-5xl">😊</div>
          <div className="space-y-2">
            <p>You are Happy!</p>
            <Button variant="outline">
              <ArrowUpDown strokeWidth={1.25} />
              <p>Change Mood</p>
            </Button>
          </div>
        </div>
        <Link
          href="/portal/#articles"
          className="relative m-0 flex items-center gap-5 rounded-2xl border border-gray-200 p-5"
        >
          <p className="absolute bottom-5 left-5 w-1/3">View Articles</p>
          <div className="absolute top-5 right-5 rounded-full border border-gray-200 p-2">
            <ArrowUpRight strokeWidth={1.25} />
          </div>
        </Link>
        <Link
          href="/portal/#announcements"
          className="relative m-0 flex items-center gap-5 rounded-2xl border border-gray-200 p-5"
        >
          <p className="absolute bottom-5 left-5 w-1/3">View Announcements</p>
          <div className="absolute top-5 right-5 rounded-full border border-gray-200 p-2">
            <ArrowUpRight strokeWidth={1.25} />
          </div>
        </Link>
        <Link
          href="/portal/#playlists"
          className="relative m-0 flex items-center gap-5 rounded-2xl border border-gray-200 p-5"
        >
          <p className="absolute bottom-5 left-5 w-1/3">View Playlists</p>
          <div className="absolute top-5 right-5 rounded-full border border-gray-200 p-2">
            <ArrowUpRight strokeWidth={1.25} />
          </div>
        </Link>
        <Link
          href="/portal/"
          className="relative flex items-center gap-5 rounded-2xl border border-gray-200 p-5"
        >
          <p className="absolute bottom-5 left-5 w-1/2">Go to Home Page</p>
          <div className="absolute top-5 right-5 rounded-full border border-gray-200 p-2">
            <ArrowUpRight strokeWidth={1.25} />
          </div>
        </Link>
      </div>
      <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Profile Information</p>
            <p>
              Ensure these details are complete for a better service experience.
            </p>
          </div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Edit2 strokeWidth={1.25} />
            <p>Edit Profile</p>
          </Button>
        </div>
        <div className="mt-10 grid w-full grid-cols-[150px_1fr] gap-x-8 gap-y-4">
          <div className="from-brand-light to-brand-normal relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-t">
            <div className="absolute right-0 bottom-0 cursor-pointer rounded-full border border-gray-200 bg-white p-2">
              <Edit2
                onClick={() => toast.info("This is an upcoming feature")}
                size={20}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              <>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-xl border-1 px-4 py-2 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </>
            ) : (
              [
                { label: "Username", value: studentData?.username },
                { label: "First Name", value: studentData?.first_name },
                { label: "Last Name", value: studentData?.last_name },
                { label: "Email", value: studentData?.email },
                { label: "College", value: studentData?.college_name },
                { label: "Department", value: studentData?.department },
                { label: "Year Level", value: studentData?.year_level },
                { label: "University ID", value: studentData?.university_id },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border-1 px-4 py-2">
                  <p className="font-medium">{item.label}</p>
                  <p>{item.value}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
