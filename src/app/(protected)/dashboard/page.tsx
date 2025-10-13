"use client";

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
    <div>
      <h1>Key Performance Indicators</h1>
      <ul>
        <li>Sales Growth</li>
        <li>Customer Satisfaction</li>
        <li>Operational Efficiency</li>
      </ul>
    </div>
  );
}
