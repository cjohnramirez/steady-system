"use client";

import { useState, type ReactNode } from "react";
import {
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  Clock,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  RoleSidebarShell,
  type SidebarNavGroupDef,
} from "@/components/app/role-sidebar";
import { Button } from "@/components/ui/button";
import { CrisisSupportDialog } from "@/components/app/crisis-dialog";

const COUNSELOR_GROUPS: readonly SidebarNavGroupDef[] = [
  {
    title: "Clinical Workspace",
    items: [
      {
        href: "/counselor",
        label: "Daily Checking",
        icon: CalendarClock,
        exact: true,
      },
      {
        href: "/counselor/appointments",
        label: "Appointments",
        icon: ClipboardCheck,
      },
      {
        href: "/counselor/students",
        label: "Student Dossier",
        icon: Users,
      },
    ],
  },
  {
    title: "Office & Practices",
    items: [
      {
        href: "/counselor/availability",
        label: "Availability & Schedule",
        icon: Clock,
      },
      {
        href: "/counselor/analytics",
        label: "Analytics",
        icon: BarChart3,
      },
    ],
  },
];

const DUTY_OPTIONS = [
  { value: "in_session", label: "In Active Session", dot: "bg-destructive" },
  { value: "available", label: "Available for Walk-ins", dot: "bg-positive" },
  { value: "writing_notes", label: "Writing Notes / DND", dot: "bg-warning" },
  { value: "off_duty", label: "Off Duty", dot: "bg-muted-foreground" },
] as const;

export function CounselorSidebarShell({
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
  const [duty, setDuty] = useState<string>("available");
  const [crisisOpen, setCrisisOpen] = useState(false);

  const currentDuty =
    DUTY_OPTIONS.find((d) => d.value === duty) ?? DUTY_OPTIONS[1];

  return (
    <>
      <RoleSidebarShell
        roleLabel="Counselor"
        userId={userId}
        userName={userName}
        userSubtitle={userSubtitle}
        userAvatar={userAvatar}
        groups={COUNSELOR_GROUPS}
        privacyLabel="Enable Desk Privacy"
        topSlot={
          <div className="bg-card border-border shadow-steady-card flex items-center gap-2.5 rounded-[25px] border px-3.5 py-2">
            <span
              aria-hidden
              className={`size-2.5 shrink-0 rounded-full ${currentDuty.dot}`}
            />
            <select
              aria-label="Counselor duty status"
              value={duty}
              onChange={(e) => setDuty(e.target.value)}
              className="w-full cursor-pointer bg-transparent text-sm outline-none"
            >
              {DUTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        }
        footerSlot={
          <Button
            variant="destructive"
            size="sm"
            className="w-full justify-start"
            onClick={() => setCrisisOpen(true)}
          >
            <ShieldAlert className="size-4" />
            Crisis Protocol
          </Button>
        }
      >
        {children}
      </RoleSidebarShell>

      <CrisisSupportDialog
        open={crisisOpen}
        onOpenChange={setCrisisOpen}
        role="counselor"
      />
    </>
  );
}
