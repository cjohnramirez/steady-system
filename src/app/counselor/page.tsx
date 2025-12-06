"use client";

import { createClient } from "@/utils/supabase/client";
import CounselorAppointmentSection from "./_components/appointment-section";
import CounselorProfileSection from "./_components/profile-section";
import MetricSection from "./_components/metric-section";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/hooks/auth-store";
import { useEffect, useState } from "react";
import {
  fetchCounselorAppointments,
  fetchCounselorProfile,
  countCounselorAppointments,
} from "./actions";

export default function CounselorPage() {
  const supabase = createClient();
  const userID = useUserStore.getState().id;

  const [username, setUsername] = useState<string | undefined>("");

  useEffect(() => {
    setUsername(useUserStore.getState().userName);
  }, []);

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 3 });
  const [status, setStatus] = useState("approved");

  const { data: counts } = useQuery({
    queryKey: ["count-counselor-appointments"],
    queryFn: () => countCounselorAppointments(supabase, userID),
  });

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["counselor-appointments", status, pagination, search],
    queryFn: () =>
      fetchCounselorAppointments(
        pagination.pageIndex,
        pagination.pageSize,
        userID,
        search,
        supabase,
        status,
      ),
  });

  const { data: counselorProfile } =
    useQuery({
      queryKey: ["counselor-profile"],
      queryFn: () => fetchCounselorProfile(supabase, userID),
    });

  return (
    <div className="space-y-6 p-10">
      <div className="space-y-2">
        <p className="text-4xl">Welcome, {username}</p>
        <p>
          This is your personalized dashboard, with your profile and
          appointments
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <MetricSection
            totalAppointments={String(counts?.totalCount ?? "")}
            pendingAppointments={String(counts?.pendingCount ?? "")}
            approvedAppointments={String(counts?.approvedCount ?? "")}
          />
          <CounselorProfileSection counselorProfile={counselorProfile} />
        </div>
        <CounselorAppointmentSection
          status={status}
          setStatus={setStatus}
          appointments={appointments?.data ?? []}
          pagination={pagination}
          setPagination={setPagination}
          count={appointments?.count ?? 0}
          setSearch={setSearch}
          isLoading={isLoadingAppointments}
        />
      </div>
    </div>
  );
}
