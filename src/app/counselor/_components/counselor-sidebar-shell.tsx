"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  Clock,
  ShieldAlert,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  RoleSidebarShell,
  type SidebarNavGroupDef,
} from "@/components/app/role-sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CrisisSupportDialog } from "@/components/app/crisis-dialog";
import { updateDutyStatus } from "@/lib/actions/clinical";
import type { DUTY_STATUSES } from "@/lib/validation/clinical";

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
  const [duty, setDuty] = useState<(typeof DUTY_STATUSES)[number]>("available");
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentDuty =
    DUTY_OPTIONS.find((d) => d.value === duty) ?? DUTY_OPTIONS[1];

  function handleDutyChange(next: (typeof DUTY_STATUSES)[number]) {
    const prev = duty;
    setDuty(next);
    startTransition(async () => {
      const res = await updateDutyStatus(next);
      if (!res.ok) {
        setDuty(prev);
        toast.error(res.error);
      } else {
        toast.success("Duty status updated");
      }
    });
  }

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
          <Select
            value={duty}
            disabled={isPending}
            onValueChange={(value) =>
              handleDutyChange(value as (typeof DUTY_STATUSES)[number])
            }
          >
            <SelectTrigger
              aria-label="Counselor duty status"
              className="w-full"
            >
              <span className="flex items-center gap-2.5 truncate">
                <span
                  aria-hidden
                  className={`size-2.5 shrink-0 rounded-full ${currentDuty.dot}`}
                />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Duty Status</SelectLabel>
                {DUTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className={`size-2.5 shrink-0 rounded-full ${opt.dot}`}
                      />
                      <span>{opt.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
