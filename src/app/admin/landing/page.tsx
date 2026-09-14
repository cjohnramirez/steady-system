import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import LandingView from "./_components/landing-view";

export const metadata: Metadata = { title: "Landing page content" };

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Landing page content"
        description="Announcements, articles and playlists shown on the home page and the portal. Select an item to edit it."
      />
      <LandingView />
    </div>
  );
}
