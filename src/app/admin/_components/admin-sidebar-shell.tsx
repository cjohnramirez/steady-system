"use client";

import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarCheck2,
  Settings,
  Users,
} from "lucide-react";
import {
  RoleSidebarShell,
  type SidebarNavGroupDef,
} from "@/components/app/role-sidebar";

const ADMIN_GROUPS: readonly SidebarNavGroupDef[] = [
  {
    title: "Executive and Audits",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: BarChart3,
      },
      {
        href: "/admin/accounts",
        label: "Accounts and Directory",
        icon: Users,
      },
      {
        href: "/admin/appointments",
        label: "Appointment Audit",
        icon: CalendarCheck2,
      },
    ],
  },
  {
    title: "Publishing and Center Profile",
    items: [
      {
        href: "/admin/landing",
        label: "Portal and CMS",
        icon: BookOpen,
      },
      {
        href: "/admin/settings",
        label: "System Settings",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebarShell({
  userId,
  userName,
  userSubtitle,
  userAvatar,
  children,
}: {
  userId: string;
  userName: string;
  userSubtitle: string;
  userAvatar?: string | null;
  children: ReactNode;
}) {
  return (
    <RoleSidebarShell
      roleLabel="Admin"
      userId={userId}
      userName={userName}
      userSubtitle={userSubtitle}
      userAvatar={userAvatar}
      groups={ADMIN_GROUPS}
      privacyLabel="Enable Campus Privacy"
      footerSlot={
        <div className="flex flex-col gap-2.5">
          <div className="bg-card border-border shadow-steady-card flex items-center justify-between rounded-[25px] border px-5 py-3.5 text-[15px]">
            <span className="text-foreground font-normal">Steady Site</span>
            <span className="text-positive inline-flex items-center gap-2 font-normal">
              Online
              <span className="bg-positive size-2.5 rounded-full" />
            </span>
          </div>
          <div className="bg-card border-border shadow-steady-card flex items-center justify-between rounded-[25px] border px-5 py-3.5 text-[15px]">
            <span className="text-foreground font-normal">UGCS Office</span>
            <span className="text-positive inline-flex items-center gap-2 font-normal">
              Active
              <span className="bg-positive size-2.5 rounded-full" />
            </span>
          </div>
        </div>
      }
    >
      {children}
    </RoleSidebarShell>
  );
}
