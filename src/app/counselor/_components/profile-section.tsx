"use client";

import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/types/supabase";
import { useState } from "react";
import AvailabilityModal from "./availability-modal";
import DepartmentModal from "./department-modal";
import CounselorProfileModal from "./profile-modal";
import { useUserStore } from "@/hooks/auth-store";
import { useQuery } from "@tanstack/react-query";
import { fetchCounselorProfile } from "../actions";
import { createClient } from "@/utils/supabase/client";

export default function CounselorProfileSection() {
  const supabase = createClient();
  const counselorID = useUserStore.getState().id;

  const [openAvailability, setOpenAvailability] = useState(false);
  const [openDepartment, setOpenDepartment] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const userID = useUserStore.getState().id;

  const { data: counselorProfile } = useQuery({
    queryKey: ["counselor-profile"],
    queryFn: () => fetchCounselorProfile(supabase, counselorID),
  });

  console.log(counselorProfile);

  return (
    <>
      {openAvailability && (
        <AvailabilityModal
          counselorProfile={counselorProfile}
          open={openAvailability}
          setOpen={setOpenAvailability}
        />
      )}
      {openDepartment && (
        <DepartmentModal open={openDepartment} setOpen={setOpenDepartment} />
      )}
      {openProfile && (
        <CounselorProfileModal
          open={openProfile}
          setOpen={setOpenProfile}
          userID={userID}
        />
      )}
      <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Profile Information</p>
            <p>
              Ensure these details are complete for a better service experience.
            </p>
          </div>
          <Button variant="outline" onClick={() => setOpenProfile(true)}>
            <Edit2 strokeWidth={1.25} />
            <p>Edit Profile</p>
          </Button>
        </div>
        <div className="mt-10 grid w-full grid-cols-[150px_1fr] grid-rows-2 gap-x-8 gap-y-4">
          <div className="from-brand-light to-brand-normal relative flex h-36 w-36 items-center justify-center rounded-full bg-linear-to-t">
            <div className="absolute right-0 bottom-0 cursor-pointer rounded-full border border-gray-200 bg-white p-4">
              <Edit2
                onClick={() => toast.info("This is an upcoming feature")}
                size={20}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-center gap-2">
              <p className="font-medium">Username</p>
              <p className="rounded-lg border p-2">
                {counselorProfile?.username}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <p className="font-medium">First Name</p>
              <p className="rounded-lg border p-2">
                {counselorProfile?.first_name}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <p className="font-medium">Last Name</p>
              <p className="rounded-lg border p-2">
                {counselorProfile?.last_name}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <p className="font-medium">University ID</p>
              <p className="rounded-lg border p-2">
                {counselorProfile?.university_id}
              </p>
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col justify-center gap-2">
                <p className="font-medium">Email</p>
                <p className="rounded-lg border p-2">
                  {counselorProfile?.email}
                </p>
              </div>
              <div className="flex flex-col justify-center gap-2">
                <p className="font-medium">Phone Number</p>
                <p className="rounded-lg border p-2">
                  {counselorProfile?.phone}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-1 flex-col justify-center gap-2">
                <p className="font-medium">Department</p>
                <Button
                  variant="outline"
                  onClick={() => setOpenDepartment(true)}
                >
                  See Departments
                </Button>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-2">
                <p className="font-medium">Availability</p>
                <Button
                  variant="outline"
                  onClick={() => setOpenAvailability(true)}
                >
                  Change Availability
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
