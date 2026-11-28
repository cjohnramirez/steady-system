import type { ReactNode } from "react";
import { LiveUpdates } from "@/components/live-updates";
import { ViewerProvider } from "@/components/viewer-provider";
import { guardPage } from "@/lib/auth/session";
import { StudentSidebarShell } from "./_components/student-sidebar-shell";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await guardPage("student");
  const fullName =
    `${viewer.firstName} ${viewer.lastName}`.trim() || viewer.userName;

  const subtitle = viewer.emotionalStatus
    ? viewer.emotionalStatus.charAt(0).toUpperCase() +
      viewer.emotionalStatus.slice(1)
    : "Student Account";

  return (
    <ViewerProvider viewer={viewer}>
      <LiveUpdates />
      <StudentSidebarShell
        userId={viewer.userId}
        userName={fullName}
        userSubtitle={subtitle}
        userAvatar={viewer.avatar}
      >
        {children}
      </StudentSidebarShell>
    </ViewerProvider>
  );
}
