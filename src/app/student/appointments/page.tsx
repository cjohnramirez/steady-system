import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import { LinkPending } from "@/components/app/link-pending";
import { Button } from "@/components/ui/button";
import AppointmentSection from "../_components/appointment-section";

export const metadata: Metadata = {
  title: "My Appointments",
};

export default function StudentAppointmentsPage() {
  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="My Appointments"
        description="Track your confirmed sessions, pending requests, and reschedule or cancel when needed."
        actions={
          <Button asChild>
            <Link href="/student/appointment">
              <LinkPending>
                <CalendarPlus className="size-4" />
              </LinkPending>
              Book a New Session
            </Link>
          </Button>
        }
      />
      <AppointmentSection />
    </PageTransition>
  );
}
