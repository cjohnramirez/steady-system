"use client";

import React, { useState } from "react";
import DashboardChart from "./_components/dashboard-chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAppointmentCountAnalytics,
  fetchStudentRegisterCountAnalytics,
  fetchVisitorAnalytics,
  fetchVisitorCountAnalytics,
} from "./actions";
import { Calendar, TrendingUp } from "lucide-react";

const CHART_TABS = {
  last3Months: { label: "Last 3 Months", days: 90 },
  last30Days: { label: "Last 30 Days", days: 30 },
  last7Days: { label: "Last 7 Days", days: 7 },
} as const;

type TabKey = keyof typeof CHART_TABS;

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("last3Months");

  const last3MonthsQuery = useQuery({
    queryKey: ["visitor-analytics", 90],
    queryFn: () => fetchVisitorAnalytics(90),
    staleTime: 1000 * 60 * 5,
  });

  const last30DaysQuery = useQuery({
    queryKey: ["visitor-analytics", 30],
    queryFn: () => fetchVisitorAnalytics(30),
    staleTime: 1000 * 60 * 5,
  });

  const last7DaysQuery = useQuery({
    queryKey: ["visitor-analytics", 7],
    queryFn: () => fetchVisitorAnalytics(7),
    staleTime: 1000 * 60 * 5,
  });

  const studentRegisterCount = useQuery({
    queryKey: ["student-register-count-analytics"],
    queryFn: () => fetchStudentRegisterCountAnalytics(),
    staleTime: 1000 * 60 * 5,
  });

  const appointmentCount = useQuery({
    queryKey: ["appointment-count-analytics"],
    queryFn: () => fetchAppointmentCountAnalytics(),
    staleTime: 1000 * 60 * 5,
  });
  
  const visitorCount = useQuery({
    queryKey: ["visitor-count-analytics"],
    queryFn: () => fetchVisitorCountAnalytics(),
    staleTime: 1000 * 60 * 5,
  });

  const tabs = {
    last3Months: {
      name: "last3Months" as const,
      data: last3MonthsQuery.data ?? [],
      isLoading: last3MonthsQuery.isLoading,
    },
    last30Days: {
      name: "last30Days" as const,
      data: last30DaysQuery.data ?? [],
      isLoading: last30DaysQuery.isLoading,
    },
    last7Days: {
      name: "last7Days" as const,
      data: last7DaysQuery.data ?? [],
      isLoading: last7DaysQuery.isLoading,
    },
  };

  const statsInfo = [
    {
      label: "Total Appointments Today",
      value: appointmentCount.data ?? 0,
      description: "Number of appointments scheduled for today",
    },
    {
      label: "Total Monthly Visitor Count",
      value: visitorCount.data ?? 0,
      description: "Total number of visitors in a month",
    },
    {
      label: "Total Students Registered",
      value: studentRegisterCount.data ?? 0,
      description: "Total students registered in the system",
    },
  ];

  const active = tabs[activeTab];

  return (
    <div className="text-gray-900">
      <main className="space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {statsInfo.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <h3>{item.label}</h3>
              </div>
              <div className="text-4xl">{item.value}</div>
              <div className="mt-5 font-semibold">Short Description</div>
              <div>{item.description}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-10">
          <div className="mb-4 flex items-start justify-between">
            <div className="pb-10">
              <h3 className="font-semibold">Total Unique Website Visitors</h3>
              <p>Total for the last 3 months</p>
            </div>

            <Tabs
              defaultValue={activeTab}
              onValueChange={(value) => setActiveTab(value as TabKey)}
            >
              <TabsList>
                <TabsTrigger value="last3Months">
                  {CHART_TABS.last3Months.label}
                </TabsTrigger>
                <TabsTrigger value="last30Days">
                  {CHART_TABS.last30Days.label}
                </TabsTrigger>
                <TabsTrigger value="last7Days">
                  {CHART_TABS.last7Days.label}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <DashboardChart
            chartData={{
              label: CHART_TABS[activeTab].label,
              value: Array.isArray(active.data) ? active.data : [],
            }}
          />
        </div>
      </main>
    </div>
  );
}
