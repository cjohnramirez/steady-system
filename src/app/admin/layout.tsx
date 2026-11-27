import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MonitorSmartphone } from "lucide-react";
import { LiveUpdates } from "@/components/live-updates";
import { ViewerProvider } from "@/components/viewer-provider";
import { guardPage } from "@/lib/auth/session";
import { BRAND } from "@/lib/brand";
import { AdminSidebarShell } from "./_components/admin-sidebar-shell";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} Admin`,
    template: `%s | ${BRAND.name} Admin`,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await guardPage("admin");
  const fullName =
    `${viewer.firstName} ${viewer.lastName}`.trim() || viewer.userName;

  return (
    <ViewerProvider viewer={viewer}>
      <LiveUpdates />
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 py-16 text-center lg:hidden">
        <MonitorSmartphone aria-hidden strokeWidth={1} className="size-14" />
        <h1 className="text-2xl tracking-tight">Use a larger screen</h1>
        <p className="text-muted-foreground max-w-sm">
          The admin console needs at least a tablet in landscape or a laptop.
          Please switch devices or widen this window.
        </p>
      </div>
      <div className="hidden lg:block">
        <AdminSidebarShell
          userId={viewer.userId}
          userName={fullName}
          userSubtitle="Director of Guidance"
          userAvatar={viewer.avatar}
        >
          {children}
        </AdminSidebarShell>
      </div>
    </ViewerProvider>
  );
}
