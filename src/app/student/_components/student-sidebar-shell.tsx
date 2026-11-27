"use client";

import { useState, type ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Home,
  ShieldAlert,
  UserCircle,
  Wind,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  RoleSidebarShell,
  type SidebarNavGroupDef,
} from "@/components/app/role-sidebar";
import { Button } from "@/components/ui/button";
import { CrisisSupportDialog } from "@/components/app/crisis-dialog";

const BreathingPacerDialog = dynamic(
  () =>
    import("@/components/student/breathing-pacer-dialog").then(
      (mod) => mod.BreathingPacerDialog,
    ),
  { ssr: false },
);

const STUDENT_GROUPS: readonly SidebarNavGroupDef[] = [
  {
    title: "Personal Space",
    items: [
      { href: "/student", label: "Sanctuary Home", icon: Home, exact: true },
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
    title: "Self-Care & Resources",
    items: [
      { href: "/portal", label: "Wellness & Audio", icon: BookOpen },
      {
        href: "/student/profile",
        label: "Profile & Contacts",
        icon: UserCircle,
      },
      { href: "/home", label: "Public Home", icon: CalendarDays },
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
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);

  return (
    <>
      <RoleSidebarShell
        roleLabel="Student"
        userId={userId}
        userName={userName}
        userSubtitle={userSubtitle}
        userAvatar={userAvatar}
        groups={STUDENT_GROUPS}
        privacyLabel="Enable Campus Privacy"
        footerSlot={
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setBreathingOpen(true)}
            >
              <Wind className="text-primary size-4" />
              4-7-8 Breathing Pacer
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start"
              onClick={() => setCrisisOpen(true)}
            >
              <ShieldAlert className="size-4" />
              Immediate Help
            </Button>
          </div>
        }
      >
        {children}
      </RoleSidebarShell>

      <BreathingPacerDialog
        open={breathingOpen}
        onOpenChange={setBreathingOpen}
      />
      <CrisisSupportDialog
        open={crisisOpen}
        onOpenChange={setCrisisOpen}
        role="student"
      />
    </>
  );
}
