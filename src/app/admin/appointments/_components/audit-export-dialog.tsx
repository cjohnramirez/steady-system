"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditRecord } from "@/components/admin/audit-metadata-dialog";

type AuditRange = "all" | "90" | "30" | "7";
type AuditFormat = "csv" | "json";

/**
 * Export Appointment Audit Log Modal (adapted from Figma 687:1199):
 * Exports obfuscated RA 11036 appointment audit records as CSV or JSON.
 */
export function AuditExportDialog({
  open,
  onOpenChange,
  records,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: AuditRecord[];
}) {
  const [range, setRange] = useState<AuditRange>("90");
  const [format, setFormat] = useState<AuditFormat>("csv");

  function handleDownload() {
    if (records.length === 0) {
      toast.info("No audit records match your current filter.");
      return;
    }

    const filename = `steady-appointment-audit-${range === "all" ? "all" : `${range}d`}-${new Date().toISOString().slice(0, 10)}.${format}`;
    let content = "";
    let mime = "text/csv;charset=utf-8;";

    if (format === "json") {
      mime = "application/json;charset=utf-8;";
      content = JSON.stringify(
        records.map((r) => ({
          scheduled: r.scheduledLabel,
          duration_minutes: r.durationMinutes,
          obfuscated_student_code: r.obfuscatedStudentCode,
          college: r.college,
          department: r.department,
          assigned_counselor: r.counselorName,
          urgency: r.urgency,
          status: r.status,
          warm_referral: r.hasWarmReferral,
        })),
        null,
        2,
      );
    } else {
      const headers = [
        "Scheduled",
        "Duration (mins)",
        "Student Code",
        "College",
        "Department",
        "Assigned Counselor",
        "Urgency",
        "Status",
        "Warm Referral",
      ];
      const escape = (val: string | number | boolean) =>
        `"${String(val).replaceAll('"', '""')}"`;
      content = [
        headers.join(","),
        ...records.map((r) =>
          [
            r.scheduledLabel,
            r.durationMinutes,
            r.obfuscatedStudentCode,
            r.college,
            r.department,
            r.counselorName,
            r.urgency,
            r.status,
            r.hasWarmReferral ? "Yes" : "No",
          ]
            .map(escape)
            .join(","),
        ),
      ].join("\n");
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);

    toast.success(
      `Exported ${records.length} obfuscated audit records (${format.toUpperCase()})`,
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[500px]">
        {/* Static Gray Header Band */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            Export Audit Log
          </DialogTitle>
          <DialogDescription className="text-foreground/80 mt-1 text-[15px]">
            Generate obfuscated appointment audit reports for RA 11036 and
            institutional compliance (CHED / PACUCOA).
          </DialogDescription>
        </div>

        {/* Center Body */}
        <div className="space-y-5 p-5 text-left">
          <div className="space-y-2">
            <Label className="text-[15px] font-medium">Dataset</Label>
            <div className="border-border bg-muted/40 text-muted-foreground flex h-12 items-center rounded-[25px] border px-5 text-[15px]">
              Obfuscated Appointments Audit Log ({records.length} records)
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="audit-export-range"
                className="text-[15px] font-medium"
              >
                Date Range
              </Label>
              <Select
                value={range}
                onValueChange={(v) => setRange(v as AuditRange)}
              >
                <SelectTrigger id="audit-export-range" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Audit Window</SelectLabel>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="all">All Filtered Records</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="audit-export-format"
                className="text-[15px] font-medium"
              >
                Format
              </Label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as AuditFormat)}
              >
                <SelectTrigger id="audit-export-format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>File Format</SelectLabel>
                    <SelectItem value="csv">CSV (.csv) — UTF-8</SelectItem>
                    <SelectItem value="json">JSON (.json)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-muted-foreground text-[14px] leading-relaxed">
            Privacy notice: Student names and clinical SOAP/SAP notes are never
            included in administrative audit exports.
          </p>
        </div>

        {/* Static Gray Footer Band */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleDownload}>
            Download Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
