export default function MetricSection({
  totalAppointments,
  pendingAppointments,
  approvedAppointments,
}: {
  totalAppointments: string;
  pendingAppointments: string;
  approvedAppointments: string;
}) {
  return (
    <section className="flex flex-col space-y-4 rounded-2xl border border-gray-200 bg-white p-8">
      <div>
        <p className="font-medium">Metric</p>
        <p>View some insightful information here.</p>
      </div>
      <div className="flex gap-3 rounded-2xl border p-3">
        <div className="flex-2 rounded-2xl border p-3 text-center">
          <p>Total Appointments</p>
          <p className="text-3xl">{totalAppointments}</p>
        </div>
        <div className="flex-1 rounded-2xl border p-3 text-center">
          <p>Approved</p>
          <p className="text-3xl">{approvedAppointments}</p>
        </div>
        <div className="flex-1 rounded-2xl border p-3 text-center">
          <p>Pending</p>
          <p className="text-3xl">{pendingAppointments}</p>
        </div>
      </div>
    </section>
  );
}
