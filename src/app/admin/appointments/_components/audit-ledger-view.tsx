"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
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
import { PillTabs } from "@/components/app/pill-tabs";
import { StatusBadge, UrgencyBadge } from "@/components/app/status-badge";
import {
  AuditMetadataDialog,
  type AuditRecord,
} from "@/components/admin/audit-metadata-dialog";

const PAGE_SIZE = 7;

type FilterTab = "all" | "approved" | "pending" | "completed" | "referrals";

export function AuditLedgerView({ records }: { records: AuditRecord[] }) {
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [counselorFilter, setCounselorFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditRecord | null>(null);

  const counselorNames = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.counselorName))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [records],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (tab === "approved" && r.status !== "approved") return false;
      if (tab === "pending" && r.status !== "pending") return false;
      if (tab === "completed" && r.status !== "completed") return false;
      if (tab === "referrals" && !r.hasWarmReferral) return false;
      if (counselorFilter !== "all" && r.counselorName !== counselorFilter) {
        return false;
      }
      if (!q) return true;
      return (
        r.obfuscatedStudentCode.toLowerCase().includes(q) ||
        r.counselorName.toLowerCase().includes(q) ||
        r.college.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    });
  }, [records, tab, counselorFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function handleExportCsv() {
    if (filtered.length === 0) {
      toast.info("No records to export");
      return;
    }
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
    const lines = [
      headers.join(","),
      ...filtered.map((r) =>
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
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `steady-appointment-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} obfuscated audit records`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row (Figma 678:21461) */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[22px] font-medium tracking-tight">
            University Appointments Audit
          </h1>
          <p className="text-muted-foreground text-[15px]">
            Obfuscated historical ledger of counseling consultations, triage
            intake statuses, and warm referrals
          </p>
        </div>

        <Button type="button" variant="outline" onClick={handleExportCsv}>
          <Download className="size-4" />
          Export Audit Log
        </Button>
      </div>

      {/* Main White Ledger Card (Figma 678:21461) */}
      <div className="bg-card border-border shadow-steady-card space-y-4 rounded-[20px] border p-5">
        {/* 5-Tab PillTabs */}
        <PillTabs
          ariaLabel="Audit appointment filter"
          value={tab}
          onChange={(next) => {
            setTab(next as FilterTab);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All Appointments" },
            { value: "approved", label: "Confirmed Upcoming" },
            { value: "pending", label: "Pending Review" },
            { value: "completed", label: "Past Completed" },
            { value: "referrals", label: "Warm Referrals" },
          ]}
        />

        {/* Search + Counselor Dropdown Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="border-border bg-card shadow-steady-card flex h-12 flex-1 items-center gap-3 rounded-[25px] border px-5">
            <Search className="text-muted-foreground size-4 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student code, college, or counselor"
              className="w-full bg-transparent text-[15px] outline-none"
            />
          </div>

          <Select
            value={counselorFilter}
            onValueChange={(v) => {
              setCounselorFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[210px]">
              <SelectValue placeholder="All Counselors" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Counselor</SelectLabel>
                <SelectItem value="all">All Counselors</SelectItem>
                {counselorNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* 6-Column Audit Table */}
        <div className="border-border overflow-x-auto rounded-[18px] border">
          <table className="w-full min-w-[780px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-border text-foreground/85 border-b text-[14px]">
                <th className="px-5 py-4 font-medium">
                  Scheduled Date or Time
                </th>
                <th className="px-4 py-4 font-medium">Student Details</th>
                <th className="px-4 py-4 font-medium">Assigned Counselor</th>
                <th className="px-4 py-4 font-medium">Urgency</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">
                  Administrative Audit
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground px-5 py-10 text-center text-sm"
                  >
                    No appointments match your current filter.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">{row.scheduledLabel}</p>
                      <p className="text-muted-foreground text-xs">
                        {row.durationMinutes}m session
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-mono font-medium">
                        {row.obfuscatedStudentCode}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {row.college}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{row.counselorName}</p>
                      <p className="text-muted-foreground text-xs">
                        Guidance Counselor
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <UrgencyBadge urgency={row.urgency} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelected(row)}
                      >
                        Audit Metadata
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-muted-foreground text-sm">
            View {pageRows.length} out of {filtered.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <AuditMetadataDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        record={selected}
      />
    </div>
  );
}
