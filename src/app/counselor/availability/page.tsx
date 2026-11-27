import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import ProfileCard from "../_components/profile-card";

export const metadata: Metadata = {
  title: "Availability & Schedule",
};

export default function CounselorAvailabilityPage() {
  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Availability & Schedule"
        description="Configure your active counseling days, office hours, and directory details shown to students."
      />
      <ProfileCard />
    </PageTransition>
  );
}
