import type { Metadata } from "next";
import { guardPage } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";
import { formatAppointmentDate } from "@/lib/format";
import { PageTransition } from "@/components/motion/primitives";
import { AuditLedgerView } from "./_components/audit-ledger-view";
import type { AuditRecord } from "@/components/admin/audit-metadata-dialog";

export const metadata: Metadata = { title: "Appointment Audit" };

export default async function AdminAppointmentsPage() {
  await guardPage("admin");
  const supabase = await createClient();

  const { data } = await supabase
    .from("admin_appointment_audit")
    .select(
      "id, obfuscated_student_code, college_name, department_name, counselor_name, scheduled_at, duration_minutes, urgency, status, has_warm_referral",
    )
    .order("scheduled_at", { ascending: false })
    .limit(200);

  const records: AuditRecord[] = (data ?? [])
    .filter((row): row is typeof row & { id: string } => Boolean(row.id))
    .map((row) => ({
      id: row.id,
      obfuscatedStudentCode: row.obfuscated_student_code ?? "STU-••••0000",
      college: row.college_name ?? "University College",
      department: row.department_name ?? "Department",
      counselorName: row.counselor_name ?? "Assigned Counselor",
      scheduledLabel: row.scheduled_at
        ? formatAppointmentDate(row.scheduled_at)
        : "Unscheduled",
      durationMinutes: row.duration_minutes ?? 45,
      urgency: (row.urgency as AuditRecord["urgency"]) ?? "low",
      status: row.status ?? "pending",
      hasWarmReferral: Boolean(row.has_warm_referral),
    }));

  return (
    <PageTransition>
      <AuditLedgerView records={records} />
    </PageTransition>
  );
}
