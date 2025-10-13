"use client";

import React from "react";
import { Line } from "react-chartjs-2";
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

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const stats = {
    totalAppointments: 235,
    pendingAppointments: 14,
    totalUsers: 47,
  };

  const chartData = {
    labels: [
      "Sept 1",
      "Sept 4",
      "Sept 7",
      "Sept 11",
      "Sept 14",
      "Sept 17",
      "Sept 20",
      "Sept 23",
      "Sept 26",
      "Sept 29",
      "Sept 31",
    ],
    datasets: [
      {
        label: "Visitors",
        data: [20, 50, 90, 60, 100, 70, 120, 80, 95, 60, 30],
        fill: true,
        backgroundColor: "rgba(253, 186, 116, 0.4)",
        borderColor: "rgba(251, 146, 60, 1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f1f1f1" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-lg">
            Guidance and Counseling Services
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">admin01</span>
          <button className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
            Admin
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex space-x-8 px-8 py-3 border-b border-gray-200 text-sm">
        <a href="#" className="font-medium text-orange-500 border-b-2 border-orange-500 pb-1">
          Dashboard
        </a>
        <a href="#" className="hover:text-orange-500">Accounts</a>
        <a href="#" className="hover:text-orange-500">Appointments</a>
        <a href="#" className="hover:text-orange-500">Landing Page</a>
        <a href="#" className="hover:text-orange-500">Settings</a>
      </nav>

      {/* Body Section */}
      <main className="px-8 py-6 space-y-8">
        {/* KPI Header */}
        <div>
          <h2 className="text-sm font-semibold">Key Performance Indicators</h2>
          <p className="text-xs text-gray-500">
            Some important overview of the organization
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Appointments Today", value: stats.totalAppointments },
            { label: "Pending Appointments", value: stats.pendingAppointments },
            { label: "Total Users Registered", value: stats.totalUsers },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-xl shadow-sm border border-gray-100 bg-gradient-to-b from-orange-100 to-orange-200"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm text-gray-800 font-semibold">{item.label}</h3>
                <span className="text-xs font-medium text-gray-600 bg-white/60 px-2 py-1 rounded-md">
                  +12.5%
                </span>
              </div>
              <div className="text-4xl font-bold mb-2">{item.value}</div>
              <div className="text-sm text-gray-700">
                Trending up this month <span className="ml-1">↗</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Visitors for the last 6 months
              </p>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Total Unique Website Visitors
              </h3>
              <p className="text-xs text-gray-500">Total for the last 3 months</p>
            </div>
            <div className="flex space-x-2 text-xs">
              <button className="px-2 py-1 rounded-md bg-gray-100 font-medium">
                Last 3 months
              </button>
              <button className="px-2 py-1 rounded-md hover:bg-gray-100">
                Last 30 days
              </button>
              <button className="px-2 py-1 rounded-md hover:bg-gray-100">
                Last 7 days
              </button>
            </div>
          </div>
          <Line data={chartData} options={chartOptions} />
        </div>
      </main>
    </div>
  );
}
