"use client";

import { useMemo, useState, useTransition } from "react";
import { json2csv } from "json-2-csv";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { DbError } from "@/lib/db/error";

export type AccountType = "students" | "counselors";
type FileType = "csv" | "json";

const SORTS: Record<AccountType, { value: string; label: string }[]> = {
  students: [
    { value: "last_name", label: "Last name" },
    { value: "first_name", label: "First name" },
    { value: "university_id", label: "University ID" },
    { value: "department", label: "Department" },
  ],
  counselors: [
    { value: "last_name", label: "Last name" },
    { value: "first_name", label: "First name" },
    { value: "username", label: "Username" },
  ],
};

const LIMITS = ["all", "50", "100", "500"];
const CHUNK = 1000;

/**
 * Exports accounts to a file.
 *
 * Fixed: the row count defaulted to NaN, `range(0, n)` returned one row too many,
 * "sort by" was ignored, PostgREST's 1000-row cap silently truncated larger exports
 * (this pages through instead), and the object URL was revoked before some browsers
 * had started the download.
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
  const [fileType, setFileType] = useState<FileType>("csv");
  const [limit, setLimit] = useState("all");
  const [sort, setSort] = useState("last_name");
  const [isPending, startTransition] = useTransition();

  const run = () =>
    startTransition(async () => {
      try {
        const table =
          type === "students"
            ? "student_with_details"
            : "counselor_with_details";
        const max = limit === "all" ? Infinity : Number(limit);
        const rows: Record<string, unknown>[] = [];

        for (let from = 0; rows.length < max; from += CHUNK) {
          const to = Math.min(from + CHUNK, max) - 1;
          const { data, error } = await supabase
            .from(table)
            .select("*")
            .order(sort)
            .order("id")
            .range(from, to);
          if (error) throw new DbError("Could not export accounts", error);
          rows.push(...data);
          if (data.length < to - from + 1) break;
        }

        if (rows.length === 0) {
          toast.info("There's nothing to export yet.");
          return;
        }

        const body =
          fileType === "csv" ? json2csv(rows) : JSON.stringify(rows, null, 2);
        const url = URL.createObjectURL(
          new Blob([body], {
            type: fileType === "csv" ? "text/csv" : "application/json",
          }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `steady-${type}-${new Date().toISOString().slice(0, 10)}.${fileType}`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);

        toast.success(`Exported ${rows.length} ${type}.`);
        onClose();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Export failed.");
      }
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export accounts</DialogTitle>
          <DialogDescription>
            Downloads a file with personal information. Store and share it
            responsibly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="export-type">Accounts</Label>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value as AccountType);
                setSort("last_name");
              }}
            >
              <SelectTrigger id="export-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="counselors">Counselors</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-format">Format</Label>
            <Select
              value={fileType}
              onValueChange={(value) => setFileType(value as FileType)}
            >
              <SelectTrigger id="export-format" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (spreadsheet)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-limit">How many</Label>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger id="export-limit" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMITS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value === "all" ? "All" : `First ${value}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-sort">Sort by</Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger id="export-sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS[type].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={run} loading={isPending}>
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
