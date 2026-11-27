"use client";

import Link from "next/link";
import { Building2, CalendarPlus, Clock, Mail, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/user-avatar";
import { cn } from "@/lib/utils";

export interface CounselorProfileInfo {
  id: string;
  name: string;
  department: string;
  email?: string | null;
  avatar?: string | null;
  officeRoom?: string | null;
  bio?: string | null;
  dutyStatus?: "available" | "in_session" | "writing_notes" | "off_duty" | null;
  officeHours?: string | null;
}

const DUTY_META: Record<
  NonNullable<CounselorProfileInfo["dutyStatus"]>,
  { label: string; dot: string }
> = {
  available: { label: "Available for walk-ins", dot: "bg-positive" },
  in_session: { label: "In an active session", dot: "bg-destructive" },
  writing_notes: { label: "Writing session notes", dot: "bg-warning" },
  off_duty: { label: "Currently off duty", dot: "bg-muted-foreground" },
};

export function CounselorDetailsDialog({
  open,
  onOpenChange,
  counselor,
  showBookAction = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counselor: CounselorProfileInfo | null;
  showBookAction?: boolean;
}) {
  if (!counselor) return null;

  const duty = counselor.dutyStatus
    ? DUTY_META[counselor.dutyStatus]
    : DUTY_META.available;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3.5">
            <UserAvatar
              name={counselor.name}
              src={counselor.avatar}
              className="size-14 shrink-0 rounded-[16px]"
            />
            <div className="min-w-0 space-y-1 text-left">
              <DialogTitle className="truncate">{counselor.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1.5">
                <Building2 className="size-3.5 shrink-0" />
                <span className="truncate">{counselor.department}</span>
              </DialogDescription>
              <span className="bg-muted text-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
                <span
                  aria-hidden
                  className={cn("size-2 rounded-full", duty.dot)}
                />
                {duty.label}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {counselor.bio && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {counselor.bio}
            </p>
          )}

          <div className="bg-muted/60 border-border space-y-2.5 rounded-[16px] border p-4 text-sm">
            <div className="flex items-center gap-2.5">
              <MapPin className="text-primary size-4 shrink-0" />
              <span>
                {counselor.officeRoom ||
                  "Guidance & Counseling Office, Main Bldg"}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="text-primary size-4 shrink-0" />
              <span>
                {counselor.officeHours || "Mon – Fri, 8:00 AM – 5:00 PM"}
              </span>
            </div>
            {counselor.email && (
              <div className="flex items-center gap-2.5">
                <Mail className="text-primary size-4 shrink-0" />
                <span className="truncate">{counselor.email}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {showBookAction && (
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link href="/student/appointment">
                <CalendarPlus className="size-4" />
                Book a session
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
