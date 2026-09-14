import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { guardPage } from "@/lib/auth/session";
import ProfileSection from "./_components/profile-section";
import MoodCard from "./_components/mood-card";
import QuickLinks from "./_components/quick-links";
import StudentAppointmentSection from "./_components/appointment-section";

export const metadata: Metadata = { title: "My dashboard" };

export default async function StudentPage() {
  // Cached per request, so this reuses the layout's lookup.
  const viewer = await guardPage("student");

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <PageHeader
        title={`Welcome, ${viewer.firstName}`}
        description="Your profile, how you're feeling and your appointments, in one place."
        actions={
          <Button asChild>
            <Link href="/student/appointment">
              <CalendarPlus aria-hidden />
              Book an appointment
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-4 md:gap-6">
          <MoodCard />
          <QuickLinks />
        </div>
        <ProfileSection className="xl:col-span-2" />
      </div>
      <StudentAppointmentSection />
    </div>
  );
}
