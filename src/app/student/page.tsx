import type { Metadata } from "next";
import { guardPage } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";
import {
  formatAppointmentDate,
  formatClockTime,
  formatEventRange,
} from "@/lib/format";
import type { CounselorProfileInfo } from "@/components/student/counselor-details-dialog";
import { PageTransition } from "@/components/motion/primitives";
import { expandArticleContent } from "@/lib/wellness/expand-article";
import { StudentDashboardView } from "./_components/student-dashboard-view";

export const metadata: Metadata = { title: "My Dashboard" };

export default async function StudentPage() {
  const viewer = await guardPage("student");
  const supabase = await createClient();

  const [
    { data: actionItems },
    { data: nextAppointment },
    { data: nextEvent },
    { data: latestArticle },
    { data: studentRow },
  ] = await Promise.all([
    supabase
      .from("action_item")
      .select("id, title, is_completed, due_date")
      .eq("student_id", viewer.profileId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("appointment_with_details")
      .select(
        "id, counselor_id, first_counselor_name, last_counselor_name, scheduled_at, status",
      )
      .eq("student_id", viewer.profileId)
      .in("status", ["approved", "pending"])
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("announcement")
      .select(
        "id, title, description, start_date, end_date, location, announcement_image",
      )
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("article")
      .select("id, title, author_name, content, link, article_image")
      .order("added_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("student_with_details")
      .select("department_id, department")
      .eq("id", viewer.profileId)
      .maybeSingle(),
  ]);

  // Fetch assigned counselor details for CounselorDetailsDialog
  let counselorRow = null;
  if (nextAppointment?.counselor_id) {
    const { data } = await supabase
      .from("counselor_with_details")
      .select("*")
      .eq("id", nextAppointment.counselor_id)
      .maybeSingle();
    counselorRow = data;
  } else if (studentRow?.department_id) {
    const { data } = await supabase
      .from("counselor_with_details")
      .select("*")
      .contains("department_ids", [studentRow.department_id])
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    counselorRow = data;
  }

  const counselorName = counselorRow
    ? `${counselorRow.first_name ?? ""} ${counselorRow.last_name ?? ""}`.trim()
    : nextAppointment
      ? `${nextAppointment.first_counselor_name ?? ""} ${nextAppointment.last_counselor_name ?? ""}`.trim()
      : "Dr. Elena Santos, RGC";

  const availableWeekdays = (counselorRow?.day_of_week ?? [])
    .map((open, idx) => (open ? idx : -1))
    .filter((idx) => idx >= 0);

  const counselorProfile: CounselorProfileInfo | null = counselorRow
    ? {
        id: counselorRow.id ?? "",
        name: counselorName || "Assigned Counselor",
        department: studentRow?.department ?? "Guidance Office",
        roleTitle: "Guidance Counselor, RGC",
        email: counselorRow.email,
        avatar: counselorRow.avatar,
        officeRoom: "West Hall Room 204",
        officeHours: `${formatClockTime(counselorRow.start_time)} – ${formatClockTime(counselorRow.end_time)}`,
        availableWeekdays:
          availableWeekdays.length > 0 ? availableWeekdays : [1, 2, 3, 4, 5],
      }
    : nextAppointment
      ? {
          id: nextAppointment.counselor_id ?? "",
          name: counselorName || "Assigned Counselor",
          department: studentRow?.department ?? "Guidance Office",
          roleTitle: "Guidance Counselor, RGC",
          officeRoom: "West Hall Room 204",
          officeHours: "08:30 AM – 05:00 PM",
          availableWeekdays: [1, 2, 3, 4, 5],
        }
      : null;

  const upcomingSession =
    nextAppointment?.id && nextAppointment.scheduled_at
      ? {
          id: nextAppointment.id,
          counselorName: counselorName || "Your Counselor",
          officeRoom: counselorProfile?.officeRoom ?? "West Hall Room 204",
          scheduledLabel: formatAppointmentDate(nextAppointment.scheduled_at),
          durationMinutes: 45,
        }
      : null;

  const featuredEvent = nextEvent
    ? {
        id: nextEvent.id,
        title: nextEvent.title,
        description: nextEvent.description,
        dateLabel: formatEventRange(nextEvent.start_date, nextEvent.end_date),
        location: nextEvent.location,
        imageUrl: nextEvent.announcement_image || null,
      }
    : null;

  const featuredArticle = latestArticle
    ? (() => {
        const mood = viewer.emotionalStatus
          ? viewer.emotionalStatus.charAt(0).toUpperCase() +
            viewer.emotionalStatus.slice(1)
          : "Calm";
        const expanded = expandArticleContent({
          title: latestArticle.title,
          content: latestArticle.content,
          author: latestArticle.author_name,
          mood,
        });
        return {
          id: latestArticle.id,
          title: latestArticle.title,
          author: latestArticle.author_name,
          mood,
          readMinutes: expanded.readMinutes,
          summary: expanded.summary,
          body: expanded.body,
          url: latestArticle.link || null,
          imageUrl: latestArticle.article_image || null,
        };
      })()
    : null;

  return (
    <PageTransition>
      <StudentDashboardView
        firstName={viewer.firstName}
        initialMood={viewer.emotionalStatus}
        upcomingSession={upcomingSession}
        counselorProfile={counselorProfile}
        initialActionItems={actionItems ?? []}
        featuredEvent={featuredEvent}
        featuredArticle={featuredArticle}
      />
    </PageTransition>
  );
}
