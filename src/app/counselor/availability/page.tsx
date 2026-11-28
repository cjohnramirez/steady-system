import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import ProfileCard from "../_components/profile-card";

export const metadata: Metadata = {
  title: "Office Hours & Weekly Schedule",
};

export default function CounselorAvailabilityPage() {
  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Office Hours & Weekly Schedule"
        description="Click any time slot to open it for booking or block it for breaks and desk work"
      />
      <ProfileCard />
    </PageTransition>
  );
}
