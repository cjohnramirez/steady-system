"use client";

import { useMemo, useState } from "react";
import { Download, Search, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { AuditExportDialog } from "./audit-export-dialog";

const PAGE_SIZE = 7;

type FilterTab = "all" | "approved" | "pending" | "completed" | "referrals";
type UrgencyFilter = "all" | "high" | "medium" | "low";

export function AuditLedgerView({ records }: { records: AuditRecord[] }) {
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [counselorFlagActive, setCounselorFlagActive] = useState(false);
  const [flagDropdownOpen, setFlagDropdownOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditRecord | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const counselorNames = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.counselorName))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [records],
  );

  const matchingCounselors = useMemo(() => {
    if (!counselorFlagActive) return [];
    const q = search.trim().toLowerCase();
    return q
      ? counselorNames.filter((name) => name.toLowerCase().includes(q))
      : counselorNames;
  }, [counselorFlagActive, counselorNames, search]);

  const safeHighlightedIdx =
    matchingCounselors.length > 0
      ? Math.min(highlightedIdx, matchingCounselors.length - 1)
      : 0;

  function handleSearchChange(val: string) {
    if (!counselorFlagActive) {
      const match = val.match(/^counselor:\s*(.*)$/i);
      if (match) {
        setCounselorFlagActive(true);
        setFlagDropdownOpen(true);
        setHighlightedIdx(0);
        setSearch(match[1]);
        setPage(1);
        return;
      }
    } else {
      setFlagDropdownOpen(true);
      setHighlightedIdx(0);
    }
    setSearch(val);
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (tab === "approved" && r.status !== "approved") return false;
      if (tab === "pending" && r.status !== "pending") return false;
      if (tab === "completed" && r.status !== "completed") return false;
      if (tab === "referrals" && !r.hasWarmReferral) return false;
      if (urgencyFilter !== "all" && r.urgency !== urgencyFilter) return false;
      if (!q) return true;
      if (counselorFlagActive) {
        return r.counselorName.toLowerCase().includes(q);
      }
      return (
        r.obfuscatedStudentCode.toLowerCase().includes(q) ||
        r.counselorName.toLowerCase().includes(q) ||
        r.college.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    });
  }, [records, tab, urgencyFilter, search, counselorFlagActive]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

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

        <Button
          type="button"
          variant="outline"
          onClick={() => setExportOpen(true)}
        >
          <Download strokeWidth={1.5} className="size-4" />
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

        {/* Search (with Counselor: flag) + Urgency Dropdown Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <div className="border-border bg-card shadow-steady-card flex h-12 items-center gap-2.5 rounded-[25px] border px-5">
              <Search
                strokeWidth={1.5}
                className="text-muted-foreground size-4 shrink-0"
              />
              {counselorFlagActive && (
                <span className="bg-brand-subtle text-brand-subtle-foreground inline-flex shrink-0 items-center gap-1.5 rounded-[35px] px-2.5 py-1 text-[13px] font-medium">
                  Counselor:
                  <button
                    type="button"
                    aria-label="Remove Counselor filter flag"
                    onClick={() => {
                      setCounselorFlagActive(false);
                      setFlagDropdownOpen(false);
                      setSearch("");
                      setPage(1);
                    }}
                    className="hover:text-foreground cursor-pointer rounded-full p-0.5 transition-colors"
                  >
                    <X strokeWidth={1.75} className="size-3" />
                  </button>
                </span>
              )}
              <input
                type="text"
                value={search}
                role="combobox"
                aria-controls="audit-counselor-suggestions"
                aria-expanded={counselorFlagActive && flagDropdownOpen}
                aria-autocomplete="list"
                onFocus={() => {
                  if (counselorFlagActive) {
                    setFlagDropdownOpen(true);
                    setHighlightedIdx(0);
                  }
                }}
                onBlur={() => {
                  window.setTimeout(() => setFlagDropdownOpen(false), 150);
                }}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" &&
                    counselorFlagActive &&
                    search === ""
                  ) {
                    setCounselorFlagActive(false);
                    setFlagDropdownOpen(false);
                  } else if (e.key === "Escape") {
                    setFlagDropdownOpen(false);
                  } else if (
                    counselorFlagActive &&
                    flagDropdownOpen &&
                    matchingCounselors.length > 0
                  ) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setHighlightedIdx(
                        (prev) => (prev + 1) % matchingCounselors.length,
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setHighlightedIdx(
                        (prev) =>
                          (prev - 1 + matchingCounselors.length) %
                          matchingCounselors.length,
                      );
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      const picked = matchingCounselors[safeHighlightedIdx];
                      if (picked) {
                        setSearch(picked);
                        setFlagDropdownOpen(false);
                        setPage(1);
                      }
                    }
                  }
                }}
                placeholder={
                  counselorFlagActive
                    ? "Type a counselor name..."
                    : 'Search by student ID or college, or type "Counselor:"...'
                }
                aria-label="Search appointment audit records"
                className="w-full bg-transparent text-[15px] outline-none"
              />
            </div>

            {counselorFlagActive && flagDropdownOpen && (
              <div
                id="audit-counselor-suggestions"
                role="listbox"
                className="bg-popover border-border shadow-steady-card absolute top-[calc(100%+6px)] left-0 z-30 max-h-[220px] w-full max-w-[340px] overflow-y-auto rounded-[15px] border p-2.5"
              >
                <p className="text-muted-foreground px-3 py-1.5 text-left text-[14px] font-medium">
                  Assigned Counselors
                </p>
                {matchingCounselors.length === 0 ? (
                  <p className="text-muted-foreground px-3 py-2 text-left text-[15px]">
                    No matching counselors
                  </p>
                ) : (
                  matchingCounselors.map((name, idx) => {
                    const isHighlighted = idx === safeHighlightedIdx;
                    return (
                      <button
                        key={name}
                        type="button"
                        role="option"
                        aria-selected={isHighlighted}
                        onMouseEnter={() => setHighlightedIdx(idx)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearch(name);
                          setFlagDropdownOpen(false);
                          setPage(1);
                        }}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-start rounded-[10px] px-3 py-2.5 text-left text-[15px] transition-colors",
                          isHighlighted
                            ? "bg-muted text-foreground"
                            : "text-foreground hover:bg-muted/60",
                        )}
                      >
                        {name}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <Select
            value={urgencyFilter}
            onValueChange={(v) => {
              setUrgencyFilter(v as UrgencyFilter);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Filter by urgency">
              <SelectValue placeholder="All Urgencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Urgency</SelectLabel>
                <SelectItem value="all">All Urgencies</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* 6-Column Audit Table */}
        <div className="border-border shadow-steady-card overflow-x-auto rounded-[20px] border">
          <table className="w-full min-w-[780px] border-collapse text-left text-[15px]">
            <thead>
              <tr className="border-border text-foreground border-b text-[15px]">
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
                    className="text-muted-foreground px-5 py-10 text-center text-[15px]"
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
                      <p className="text-foreground font-normal">
                        {row.scheduledLabel}
                      </p>
                      <p className="text-muted-foreground text-[14px]">
                        {row.durationMinutes}m session
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-foreground font-normal tabular-nums">
                        {row.obfuscatedStudentCode}
                      </p>
                      <p className="text-muted-foreground text-[14px]">
                        {row.college}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-foreground font-normal">
                        {row.counselorName}
                      </p>
                      <p className="text-muted-foreground text-[14px]">
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
                      <Button type="button" onClick={() => setSelected(row)}>
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
          <p className="text-muted-foreground text-[15px]">
            View {pageRows.length} out of {filtered.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
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

      <AuditExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        records={filtered}
      />
    </div>
  );
}
