"use client";

import { useMemo, useState, useTransition } from "react";
import { json2csv } from "json-2-csv";
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
import { createClient } from "@/utils/supabase/client";
import { DbError } from "@/lib/db/error";

export type AccountType = "students" | "counselors";
type FileType = "csv" | "json";
type DateRangeOption = "all" | "90" | "30" | "7";

const CHUNK = 1000;

/**
 * Export Institutional Data Modal (Figma 687:1199):
 * 3-band Figma modal for anonymized CSV / JSON directory exports.
 */
export default function ExportDialog({
  defaultType,
  onClose,
}: {
  defaultType: AccountType;
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [type, setType] = useState<AccountType>(defaultType);
  const [range, setRange] = useState<DateRangeOption>("90");
  const [fileType, setFileType] = useState<FileType>("csv");
  const [isPending, startTransition] = useTransition();

  const run = () =>
    startTransition(async () => {
      try {
        const table =
          type === "students"
            ? "student_with_details"
            : "counselor_with_details";
        const rows: Record<string, unknown>[] = [];

        for (let from = 0; ; from += CHUNK) {
          const to = from + CHUNK - 1;
          const { data, error } = await supabase
            .from(table)
            .select("*")
            .order("last_name")
            .order("id")
            .range(from, to);
          if (error) throw new DbError("Could not export accounts", error);
          rows.push(...data);
          if (data.length < CHUNK) break;
        }

        if (rows.length === 0) {
          toast.info("There's nothing to export yet.");
          return;
        }

        const body =
          fileType === "csv" ? json2csv(rows) : JSON.stringify(rows, null, 2);
        const url = URL.createObjectURL(
          new Blob([body], {
            type:
              fileType === "csv"
                ? "text/csv;charset=utf-8;"
                : "application/json;charset=utf-8;",
          }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `steady-${type}-${range === "all" ? "all" : `${range}d`}-${new Date().toISOString().slice(0, 10)}.${fileType}`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);

        toast.success(`Exported ${rows.length} ${type} records.`);
        onClose();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Export failed.");
      }
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[500px]">
        {/* Static Gray Header Band (Figma 687:1199) */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            Export Institutional Data
          </DialogTitle>
          <DialogDescription className="text-foreground/80 mt-1 text-[15px]">
            Generate anonymized CSV or accreditation reports (CHED / PACUCOA).
          </DialogDescription>
        </div>

        {/* Center Body */}
        <div className="space-y-5 p-5 text-left">
          <div className="space-y-2">
            <Label htmlFor="export-dataset" className="text-[15px] font-medium">
              Dataset
            </Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as AccountType)}
            >
              <SelectTrigger id="export-dataset" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Institutional Directory</SelectLabel>
                  <SelectItem value="students">
                    Student Directory Records
                  </SelectItem>
                  <SelectItem value="counselors">
                    Guidance Counselor Roster
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="export-range" className="text-[15px] font-medium">
                Date Range
              </Label>
              <Select
                value={range}
                onValueChange={(v) => setRange(v as DateRangeOption)}
              >
                <SelectTrigger id="export-range" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Window</SelectLabel>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="export-format"
                className="text-[15px] font-medium"
              >
                Format
              </Label>
              <Select
                value={fileType}
                onValueChange={(v) => setFileType(v as FileType)}
              >
                <SelectTrigger id="export-format" className="w-full">
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
            Privacy notice: Clinical SOAP/SAP notes and confidential session
            reasons are never included in administrative exports.
          </p>
        </div>

        {/* Static Gray Footer Band */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" loading={isPending} onClick={run}>
            Download Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
