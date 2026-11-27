"use client";

import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  role?: "student" | "counselor" | "admin";
}) {
  const isStaff = role !== "student";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[588px]">
        {/* Static Header band (Figma 678:18315) */}
        <div className="border-border flex shrink-0 items-start gap-5 border-b p-5 pr-12">
          <div className="bg-destructive/15 text-destructive flex size-[59px] shrink-0 items-center justify-center rounded-[14px]">
            <AlertTriangle className="size-7" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1 text-left">
            <DialogTitle className="text-[15px] font-medium">
              {isStaff
                ? "Immediate Crisis Response Protocol"
                : "Immediate Crisis Support & Help"}
            </DialogTitle>
            <DialogDescription className="text-foreground/80 text-[15px] leading-snug">
              Direct contacts for campus safety, medical escorts, and 24/7
              psychiatric emergency support
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable 3 Horizontal Action Rows (Figma 678:18323 / 18334 / 18345) */}
        <div className="divide-border/60 min-h-0 flex-1 divide-y overflow-y-auto">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-7">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[15px] font-medium">
                Campus Medical Clinic &amp; Infirmary
              </p>
              <p className="text-muted-foreground text-[14px] leading-snug">
                Direct line for on-duty physician, triage nurse, and medical
                escort
              </p>
            </div>
            <Button variant="destructive" asChild className="shrink-0">
              <a href="tel:2201">Dial Loc. 2201</a>
            </Button>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-7">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[15px] font-medium">
                24/7 National Crisis Lifeline (1553)
              </p>
              <p className="text-muted-foreground text-[14px] leading-snug">
                Toll-free emergency hotline for acute suicidal distress and
                psychological first aid
              </p>
            </div>
            <Button variant="destructive" asChild className="shrink-0">
              <a href="tel:1553">Dial 1553</a>
            </Button>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-7">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[15px] font-medium">
                Dean of Student Affairs Office (OSA)
              </p>
              <p className="text-muted-foreground text-[14px] leading-snug">
                Urgent academic welfare holds, emergency leaves, and family
                notifications
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() =>
                toast.info(
                  "OSA welfare notification logged. Call Loc. 2201 for immediate escort.",
                )
              }
            >
              Notify OSA
            </Button>
          </div>
        </div>

        {/* Static Footer band (Figma 678:18357) */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end border-t p-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close Protocol
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
