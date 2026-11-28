import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
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
        description="Track your confirmed sessions, pending requests, and post-session action plans"
        actions={
          <Button asChild variant="outline" className="px-5">
            <Link href="/student/appointment">
              <LinkPending>
                <Plus strokeWidth={1.5} className="size-4" />
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
