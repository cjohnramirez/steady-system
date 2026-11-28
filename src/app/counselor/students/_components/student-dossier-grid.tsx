"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
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
import { EmptyState } from "@/components/app/empty-state";
import { UserAvatar } from "@/components/app/user-avatar";
import {
  DossierDialog,
  type StudentDossierRecord,
} from "@/components/counselor/dossier-dialog";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

const EMOTION_PILL_STYLES: Record<string, string> = {
  calm: "bg-[#a7f3d0] text-[#065f46] dark:bg-emerald-900/60 dark:text-emerald-200",
  hopeful:
    "bg-[#a7f3d0] text-[#065f46] dark:bg-emerald-900/60 dark:text-emerald-200",
  happy:
    "bg-[#a7f3d0] text-[#065f46] dark:bg-emerald-900/60 dark:text-emerald-200",
  motivated:
    "bg-[#bfdbfe] text-[#1e40af] dark:bg-blue-900/60 dark:text-blue-200",
  stressed:
    "bg-[#fed7aa] text-[#9a3412] dark:bg-amber-950/70 dark:text-amber-200",
  lonely:
    "bg-[#fed7aa] text-[#9a3412] dark:bg-amber-950/70 dark:text-amber-200",
  overwhelmed:
    "bg-[#fed7aa] text-[#9a3412] dark:bg-amber-950/70 dark:text-amber-200",
  exhausted:
    "bg-[#fed7aa] text-[#9a3412] dark:bg-amber-950/70 dark:text-amber-200",
  anxious: "bg-[#fecaca] text-[#991b1b] dark:bg-red-950/70 dark:text-red-200",
};

function formatOrdinalYear(year?: number | null): string {
  if (!year) return "Student";
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  return `${year}${suffixes[year] ?? "th"} Year`;
}

export interface StudentDirectoryCardRecord extends StudentDossierRecord {
  lastVisited?: string | null;
}

export function StudentDossierGrid({
  students,
}: {
  students: StudentDirectoryCardRecord[];
}) {
  const [search, setSearch] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "sessions" | "year">("name");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<StudentDirectoryCardRecord | null>(
    null,
  );

  const emotionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      if (s.emotionalStatus) {
        set.add(s.emotionalStatus.toLowerCase());
      }
    }
    return Array.from(set).sort();
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = students.filter((s) => {
      if (
        emotionFilter !== "all" &&
        (s.emotionalStatus ?? "").toLowerCase() !== emotionFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        String(s.universityId ?? "")
          .toLowerCase()
          .includes(q) ||
        (s.department ?? "").toLowerCase().includes(q) ||
        (s.primaryReason ?? "").toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === "sessions") {
        return (b.totalSessions ?? 0) - (a.totalSessions ?? 0);
      }
      if (sortBy === "year") {
        return (b.yearLevel ?? 0) - (a.yearLevel ?? 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [students, search, emotionFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  return (
    <>
      <div className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5">
        {/* Top Search + Filter + Sort Bar (Figma 678:17584) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-card border-border focus-within:ring-ring/40 flex h-12 min-w-[220px] flex-1 items-center gap-2.5 rounded-[25px] border px-4 transition-shadow focus-within:ring-[3px]">
            <Search
              aria-hidden
              strokeWidth={1.5}
              className="text-muted-foreground size-4 shrink-0"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by student name, ID, department, or concern..."
              aria-label="Search students"
              className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-[14px] outline-none"
            />
          </div>

          <Select
            value={emotionFilter}
            onValueChange={(val) => {
              setEmotionFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger aria-label="Filter by emotion">
              <SelectValue placeholder="All Emotions" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Emotion</SelectLabel>
                <SelectItem value="all">All Emotions</SelectItem>
                {emotionOptions.map((em) => (
                  <SelectItem key={em} value={em} className="capitalize">
                    {em.charAt(0).toUpperCase() + em.slice(1)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(val) => {
              setSortBy(val as "name" | "sessions" | "year");
              setPage(0);
            }}
          >
            <SelectTrigger aria-label="Sort students">
              <SelectValue placeholder="Sort by Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort Order</SelectLabel>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="sessions">Sort by Sessions</SelectItem>
                <SelectItem value="year">Sort by Year Level</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* 3x2 Student Case Cards Grid */}
        {visible.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              search.trim() || emotionFilter !== "all"
                ? "No Matching Students"
                : "No Students In Your Departments Yet"
            }
            description={
              search.trim() || emotionFilter !== "all"
                ? "Try clearing your search or emotion filter."
                : "Once students register under your assigned departments, their profiles will appear here."
            }
            action={
              search.trim() || emotionFilter !== "all" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setEmotionFilter("all");
                    setPage(0);
                  }}
                >
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((student) => {
              const emotionKey = (
                student.emotionalStatus ?? "calm"
              ).toLowerCase();
              const emotionLabel =
                emotionKey.charAt(0).toUpperCase() + emotionKey.slice(1);
              const pillStyle =
                EMOTION_PILL_STYLES[emotionKey] ??
                "bg-brand-subtle text-brand-subtle-foreground";

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelected(student)}
                  className="bg-card border-border shadow-steady-card hover:border-foreground/30 focus-visible:ring-ring/50 flex cursor-pointer flex-col justify-between gap-5 rounded-[20px] border p-[21px] text-left text-[15px] transition-colors outline-none focus-visible:ring-[3px]"
                >
                  {/* Top Student Identity Row (Figma 678:17614) */}
                  <div className="flex items-center gap-5">
                    <UserAvatar
                      name={student.name || "Student"}
                      className="size-[61px] shrink-0 rounded-[10px]"
                    />
                    <div className="min-w-0 leading-snug">
                      <p className="privacy-sensitive text-foreground truncate text-[15px] font-medium">
                        {student.name || "Unnamed Student"}
                      </p>
                      <p className="text-muted-foreground privacy-sensitive truncate text-[15px] font-normal">
                        {student.universityId ?? "—"}
                      </p>
                      <p className="text-muted-foreground truncate text-[15px] font-normal">
                        {student.department ?? "Department"},{" "}
                        {formatOrdinalYear(student.yearLevel)}
                      </p>
                    </div>
                  </div>

                  {/* Primary Concern Inset Box (Figma 678:17625) */}
                  <div className="bg-card border-border shadow-steady-card w-full space-y-1.5 rounded-[20px] border p-[21px]">
                    <p className="text-foreground text-[15px] font-medium">
                      Primary Concern
                    </p>
                    <p className="text-muted-foreground privacy-sensitive line-clamp-2 text-[15px] leading-snug font-normal">
                      {student.primaryReason ?? "General Wellness Check-In"}
                    </p>
                  </div>

                  {/* Bottom 2x2 Clinical Metadata Grid (Figma 678:17628) */}
                  <div className="grid w-full grid-cols-2 gap-x-5 gap-y-3 text-[15px]">
                    <div className="space-y-1.5">
                      <p className="text-foreground font-medium">Emotion</p>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-[35px] px-3 py-1 text-[15px] leading-none font-normal",
                          pillStyle,
                        )}
                      >
                        {emotionLabel}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">
                        Total Sessions
                      </p>
                      <p className="text-muted-foreground font-normal">
                        {student.totalSessions ?? 0}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">
                        Last Visited
                      </p>
                      <p className="text-muted-foreground truncate font-normal">
                        {student.lastVisited ?? "No visits yet"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">Completed</p>
                      <p className="text-muted-foreground font-normal">
                        {student.completedSessions ?? 0}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-muted-foreground text-[14px]">
            View {visible.length} out of {filtered.length}{" "}
            {filtered.length === 1 ? "result" : "results"}
          </p>
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-5"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={safePage + 1 >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="px-5"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <DossierDialog
        key={selected?.id ?? "closed"}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        student={selected}
      />
    </>
  );
}
