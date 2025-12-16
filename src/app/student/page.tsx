"use client";

import { useState } from "react";
import { useUserStore } from "@/hooks/auth-store";
import ProfileSection from "./_components/profile-section";
import StudentAppointmentSection from "./_components/appointment-section";
import { Button } from "@/components/ui/button";
import { sendNotification } from "@/lib/notifications";
import { sendNotificationToUser } from "../actions/notifications";

export default function StudentPage() {
  const { userName, userId } = useUserStore();
  const [username] = useState(userName ?? "");

  console.log("User ID: ", userId)
  return (
    <div className="space-y-6 p-10">
      <div className="space-y-2">
        <p className="text-4xl">Welcome, {username ?? ""}</p>
        <p>
          This is your personalized dashboard, with your profile and
          appointments
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ProfileSection />
        <StudentAppointmentSection />
      </div>
    </div>
  );
}
