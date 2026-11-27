"use client";

import { PhoneCall, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function CrisisSupportDialog({
  open,
  onOpenChange,
  role = "student",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: "student" | "counselor";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-destructive/40 sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <ShieldAlert className="size-5" />
            {role === "counselor"
              ? "Clinical Crisis & Emergency Protocol"
              : "Immediate Campus Safety & Crisis Support"}
          </DialogTitle>
          <DialogDescription>
            Steady is not an emergency hotline. If someone is in immediate
            danger, contact emergency responders right away.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {[
            {
              title: "National Center for Mental Health Crisis Hotline (24/7)",
              detail:
                "1553 (Luzon) • 0917-899-8727 (Globe) • 0908-639-2672 (Smart)",
            },
            {
              title: "National Emergency Hotline",
              detail: "911 (Police, Medical & Fire Dispatch)",
            },
            {
              title: "Guidance Office Walk-In & Campus Safety",
              detail:
                "West Hall Room 204 • Office Hours: 8:00 AM – 5:00 PM (Mon–Fri)",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-muted border-border flex items-start gap-3 rounded-[16px] border p-4"
            >
              <PhoneCall className="text-destructive mt-0.5 size-4 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-destructive text-sm font-semibold">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
