import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { guardPage } from "@/lib/auth/session";
import { EmptyState } from "@/components/app/empty-state";
import { formatAppointmentDate } from "@/lib/format";
import OrganizationForm from "./organization-form";
import ContactsForm from "./contacts-form";

export const metadata: Metadata = {
  title: "System Configuration & Institutional Settings",
};

export default async function SystemSettingsPage() {
  await guardPage("admin");
  const supabase = await createClient();
  const [
    { data: organization },
    { data: contacts },
    { data: recentAppointments },
  ] = await Promise.all([
    supabase.from("organization").select("*").limit(1).maybeSingle(),
    supabase
      .from("organization_contact")
      .select("platform, contact_detail")
      .order("platform"),
    supabase
      .from("appointment_with_details")
      .select(
        "id, status, scheduled_at, first_counselor_name, last_counselor_name, student_id",
      )
      .order("scheduled_at", { ascending: false })
      .limit(3),
  ]);

  if (!organization) {
    return (
      <EmptyState
        title="No office record"
        description="Run the database seed to create one."
      />
    );
  }

  const auditEvents = (recentAppointments ?? []).map((apt) => {
    const counselor =
      `${apt.first_counselor_name ?? ""} ${apt.last_counselor_name ?? ""}`.trim() ||
      "Guidance Counselor";
    const code = apt.student_id
      ? `STU-••••${apt.student_id.replaceAll("-", "").slice(-4).toUpperCase()}`
      : "STU-••••0000";
    const actionLabel =
      apt.status === "completed"
        ? "Filed Clinical SOAP Notes"
        : apt.status === "approved"
          ? "Confirmed Counseling Session"
          : "Logged Triage Appointment";
    return {
      id: apt.id ?? code,
      title: actionLabel,
      time: formatAppointmentDate(apt.scheduled_at),
      actor: counselor,
      target: code,
    };
  });

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.15fr_1fr]">
      {/* Left Column: Organization & Clinic Profile + Recent System Audit Trail */}
      <div className="flex flex-col gap-5">
        <OrganizationForm organization={organization} />

        <section className="bg-card border-border shadow-steady-card space-y-4 rounded-[20px] border p-6">
          <div className="space-y-1">
            <h2 className="text-foreground text-[15px] font-medium">
              Recent System Audit Trail
            </h2>
            <p className="text-muted-foreground text-[14px]">
              Security &amp; clinical event monitoring
            </p>
          </div>

          {auditEvents.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-[14px]">
              No recent audit events recorded.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {auditEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-card border-border shadow-steady-card space-y-1.5 rounded-[16px] border p-4 text-[14px]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-foreground font-medium">{ev.title}</p>
                    <span className="text-muted-foreground text-[13px]">
                      {ev.time}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-[13px]">
                    <span>User: {ev.actor}</span>
                    <span>Target: {ev.target}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Right Column: Overall System Status + Campus Crisis Lifelines / Contacts */}
      <div className="flex flex-col gap-5">
        <section className="bg-card border-border shadow-steady-card space-y-4 rounded-[20px] border p-6">
          <div className="space-y-1">
            <h2 className="text-foreground text-[15px] font-medium">
              Overall System Status
            </h2>
            <p className="text-muted-foreground text-[14px]">
              No major outage reported in the last 30 days
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="bg-card border-border shadow-steady-card flex items-center justify-between rounded-[25px] border px-5 py-3.5 text-[15px]">
              <span className="text-foreground">Vercel Deployment</span>
              <span className="text-positive inline-flex items-center gap-2">
                Online
                <span className="bg-positive size-2.5 rounded-full" />
              </span>
            </div>
            <div className="bg-card border-border shadow-steady-card flex items-center justify-between rounded-[25px] border px-5 py-3.5 text-[15px]">
              <span className="text-foreground">Supabase</span>
              <span className="text-positive inline-flex items-center gap-2">
                Online
                <span className="bg-positive size-2.5 rounded-full" />
              </span>
            </div>
          </div>
        </section>

        <ContactsForm contacts={contacts ?? []} />
      </div>
    </div>
  );
}
