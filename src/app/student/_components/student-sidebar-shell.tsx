"use client";

import type { ReactNode } from "react";
import { BookOpen, CalendarPlus, ClipboardList, Home } from "lucide-react";
import {
  RoleSidebarShell,
  type SidebarNavGroupDef,
} from "@/components/app/role-sidebar";

/**
 * Strictly matches Figma Student Sidebar (678:19256 / 482:892):
 * Personal Space -> Dashboard, Book a Session, My Appointments
 * Self-Care and Resources -> Wellness and Audio
 */
const STUDENT_GROUPS: readonly SidebarNavGroupDef[] = [
  {
    title: "Personal Space",
    items: [
      { href: "/student", label: "Dashboard", icon: Home, exact: true },
      {
        href: "/student/appointment",
        label: "Book a Session",
        icon: CalendarPlus,
      },
      {
        href: "/student/appointments",
        label: "My Appointments",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Self-Care and Resources",
    items: [
      {
        href: "/student/wellness",
        label: "Wellness and Audio",
        icon: BookOpen,
      },
    ],
  },
];

export function StudentSidebarShell({
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
      roleLabel="Student"
      userId={userId}
      userName={userName}
      userSubtitle={userSubtitle}
      userAvatar={userAvatar}
      groups={STUDENT_GROUPS}
      privacyLabel="Enable Campus Privacy"
    >
      {children}
    </RoleSidebarShell>
  );
}
