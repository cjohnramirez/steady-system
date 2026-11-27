import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import ProfileSection from "../_components/profile-section";

export const metadata: Metadata = {
  title: "Profile & Emergency Contacts",
};

export default function StudentProfilePage() {
  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Profile & Emergency Contacts"
        description="Manage your personal details and trusted emergency contacts for campus safety."
      />
      <ProfileSection />
    </PageTransition>
  );
}
