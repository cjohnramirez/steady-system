"use client";

import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/types/supabase";

export default function CounselorProfileSection({
  counselorProfile,
}: {
  counselorProfile: Tables<"counselor_with_details"> | undefined;
}) {
  return (
    <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Profile Information</p>
          <p>
            Ensure these details are complete for a better service experience.
          </p>
        </div>
        <Button variant="outline">
          <Edit2 strokeWidth={1.25} />
          <p>Edit Profile</p>
        </Button>
      </div>
      <div className="mt-10 grid w-full grid-cols-[150px_1fr] grid-rows-2 gap-x-8 gap-y-4">
        <div className="from-brand-light to-brand-normal relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-t">
          <div className="absolute right-0 bottom-0 cursor-pointer rounded-full border border-gray-200 bg-white p-4">
            <Edit2
              onClick={() => toast.info("This is an upcoming feature")}
              size={20}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-center rounded-xl border-1 p-4">
            <p className="font-medium">Username</p>
            <p>{counselorProfile?.username}</p>
          </div>
          <div className="flex flex-col justify-center rounded-xl border-1 p-4">
            <p className="font-medium">First Name</p>
            <p>{counselorProfile?.first_name}</p>
          </div>
          <div className="flex flex-col justify-center rounded-xl border-1 p-4">
            <p className="font-medium">Last Name</p>
            <p>{counselorProfile?.last_name}</p>
          </div>
          <div className="flex flex-col justify-center rounded-xl border-1 p-4">
            <p className="font-medium">University ID</p>
            <p>{counselorProfile?.university_id}</p>
          </div>
        </div>
        <div className="col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-1 flex-col justify-center rounded-xl border-1 p-4">
              <p className="font-medium">Email</p>
              <p>{counselorProfile?.email}</p>
            </div>
            <div className="flex flex-1 flex-col justify-center rounded-xl border-1 p-4">
              <p className="font-medium">Phone Number</p>
              <p>{counselorProfile?.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-1 flex-col justify-center rounded-xl border-1 p-4">
              <p className="font-medium">Department</p>
              <p>{counselorProfile?.department_name}</p>
            </div>
            <div className="flex flex-1 flex-col justify-center p-4 gap-2">
              <p className="font-medium">Availability</p>
              <Button variant="outline">Change Availability</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
