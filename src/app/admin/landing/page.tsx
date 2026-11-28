import type { Metadata } from "next";
import { guardPage } from "@/lib/auth/session";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import LandingView from "./_components/landing-view";

export const metadata: Metadata = { title: "Portal and Landing Page CMS" };

export default async function LandingPage() {
  await guardPage("admin");
  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Portal and Landing Page CMS"
        description="Manage articles, soundscapes, and campus announcements published directly to the Portal and landing page"
      />
      <LandingView />
    </PageTransition>
  );
}
