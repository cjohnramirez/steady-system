import type { Metadata } from "next";
import { guardPage } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";
import { formatAppointmentDate, formatEventRange } from "@/lib/format";
import { PageTransition } from "@/components/motion/primitives";
import { StudentDashboardView } from "./_components/student-dashboard-view";

export const metadata: Metadata = { title: "My dashboard" };

export default async function StudentPage() {
  const viewer = await guardPage("student");
  const supabase = await createClient();

  const [
    { data: actionItems },
    { data: nextAppointment },
    { data: nextEvent },
    { data: latestArticle },
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
        "id, first_counselor_name, last_counselor_name, scheduled_at, status",
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
  ]);

  const upcomingSession =
    nextAppointment?.id && nextAppointment.scheduled_at
      ? {
          id: nextAppointment.id,
          counselorName:
            `${nextAppointment.first_counselor_name ?? ""} ${nextAppointment.last_counselor_name ?? ""}`.trim() ||
            "Your Counselor",
          officeRoom: "Guidance Center, West Hall",
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
    ? {
        id: latestArticle.id,
        title: latestArticle.title,
        author: latestArticle.author_name,
        mood: viewer.emotionalStatus,
        readMinutes: 5,
        summary: latestArticle.content,
        body: latestArticle.content.split(/\n{2,}/).filter(Boolean),
        url: latestArticle.link || null,
        imageUrl: latestArticle.article_image || null,
      }
    : null;

  return (
    <PageTransition>
      <StudentDashboardView
        firstName={viewer.firstName}
        initialMood={viewer.emotionalStatus}
        upcomingSession={upcomingSession}
        initialActionItems={actionItems ?? []}
        featuredEvent={featuredEvent}
        featuredArticle={featuredArticle}
      />
    </PageTransition>
  );
}
