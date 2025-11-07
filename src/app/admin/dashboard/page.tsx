"use client";

import React, { useState } from "react";
import DashboardChart from "./_components/dashboard-chart";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { graphs, statsInfo } from "@/lib/dashboard-data";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
);

export default function DashboardPage() {
  const [selectedChartTab, setSelectedChartTab] = useState(0);

  return (
    <div className=" text-gray-900">
      <main className="space-y-8">
        <div>
          <h2 className="text-md font-semibold">Key Performance Indicators</h2>
          <p className="">Some important overview of the organization</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {statsInfo.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <h3>{item.label}</h3>
                <span className="flex items-center gap-2 rounded-md px-3 py-1 text-xs font-medium border border-gray-200">
                  <TrendingUp strokeWidth={1.25} size={20} />
                  +12.5%
                </span>
              </div>
              <div className="text-4xl">{item.value}</div>
              <div className="mt-8 flex gap-2 font-semibold">
                Trending up this month
                <TrendingUp strokeWidth={2} size={20} />
              </div>
              <p>Visitors for the last 6 months</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-200 p-10 bg-white">
          <div className="mb-4 flex items-start justify-between">
            <div className="pb-10">
              <h3 className="font-semibold">Total Unique Website Visitors</h3>
              <p>Total for the last 3 months</p>
            </div>
            <Tabs
              defaultValue="0"
              onValueChange={(value) => setSelectedChartTab(Number(value))}
            >
              <TabsList>
                <TabsTrigger value="0">Last 3 Months</TabsTrigger>
                <TabsTrigger value="1">Last 30 Days</TabsTrigger>
                <TabsTrigger value="2">Last 7 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <DashboardChart chartData={graphs[selectedChartTab]} />
        </div>
      </main>
    </div>
  );
}
