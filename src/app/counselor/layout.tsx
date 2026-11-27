import type { ReactNode } from "react";
import { LiveUpdates } from "@/components/live-updates";
import { ViewerProvider } from "@/components/viewer-provider";
import { guardPage } from "@/lib/auth/session";
import { CounselorSidebarShell } from "./_components/counselor-sidebar-shell";

export default async function CounselorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await guardPage("counselor");
  const fullName =
    `${viewer.firstName} ${viewer.lastName}`.trim() || viewer.userName;

  return (
    <ViewerProvider viewer={viewer}>
      <LiveUpdates />
      <CounselorSidebarShell
        userId={viewer.userId}
        userName={fullName}
        userSubtitle="Guidance Counselor"
        userAvatar={viewer.avatar}
      >
        {children}
      </CounselorSidebarShell>
    </ViewerProvider>
  );
}
