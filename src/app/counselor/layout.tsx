import type { ReactNode } from "react";
import NavigationBar from "@/components/navigation";
import { LiveUpdates } from "@/components/live-updates";
import { ViewerProvider } from "@/components/viewer-provider";
import { guardPage } from "@/lib/auth/session";

export default async function CounselorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await guardPage("counselor");

  return (
    <ViewerProvider viewer={viewer}>
      <NavigationBar />
      <LiveUpdates />
      <main className="m-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
        {children}
      </main>
    </ViewerProvider>
  );
}
