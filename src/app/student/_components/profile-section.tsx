"use client";

import { fetchStudent } from "@/app/admin/accounts/@modal/actions";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/hooks/auth-store";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Contact, Edit2, Phone, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import StudentProfileModal from "./profile-modal";
import { Skeleton } from "@/components/ui/skeleton";
import FormEmotionalStatusField from "@/components/form-emotional-status-field";
import { strToTitleCase } from "@/lib/format";

export default function ProfileSection() {
  const studentID = useUserStore.getState().id;
  const [openProfile, setOpenProfile] = useState(false);
  const [openContactPerson, setOpenContactPerson] = useState(false);

  const { data: studentData, isLoading } = useQuery({
    queryKey: ["student-user"],
    queryFn: () => fetchStudent(studentID),
  });

  const [emotionalStatus, setEmotionalStatus] = useState("");

  return (
    <>
      {openProfile && (
        <StudentProfileModal
          open={openProfile}
          setOpen={setOpenProfile}
          id={studentID}
        />
      )}
      <div className="grid grid-cols-2 grid-rows-3 gap-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="col-span-2 m-0 flex items-center gap-5 rounded-2xl border border-gray-200 p-5">
          <div className="flex space-y-2">
            <FormEmotionalStatusField
              setEmotionalStatus={setEmotionalStatus}
              emotionalStatus={
                emotionalStatus !== ""
                  ? emotionalStatus
                  : (studentData?.emotional_status_id ?? "")
              }
              studentID={studentID}
            />
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenProfile(true)}
              disabled={isLoading}
            >
              <User strokeWidth={1.25} />
              <p>Edit Profile</p>
            </Button>
          </div>
        </div>
        <div className="mt-10 grid w-full grid-cols-[150px_1fr] gap-x-8 gap-y-4">
          <div className="from-brand-light to-brand-normal relative flex h-36 w-36 items-center justify-center rounded-full bg-linear-to-t">
            {isLoading ? (
              <Skeleton className="h-36 w-36 rounded-full" />
            ) : (
              <div className="absolute right-0 bottom-0 cursor-pointer rounded-full border border-gray-200 bg-white p-2">
                <Edit2
                  onClick={() => toast.info("This is an upcoming feature")}
                  size={20}
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              <>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-2 overflow-hidden rounded-xl border p-4"
                  >
                    <Skeleton className="h-10 w-2/5" />
                    <Skeleton className="h-10 flex-1" />
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
                { label: "Gender", value: studentData?.gender ?? "" },
                { label: "Age", value: studentData?.age },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex overflow-hidden rounded-xl border"
                >
                  <p className="w-2/5 border-r bg-gray-50 p-4 font-medium">
                    {item.label}
                  </p>
                  <p className="wrap-break-words flex-1 p-4">{item?.value}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
