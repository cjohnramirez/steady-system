"use client";

import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { fetchAnnouncementsByDate } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ChevronLeft, ChevronRight, CircleOff, Search } from "lucide-react";
import { Tables } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import AnnouncementTile from "./announcement-tile";

const DATE_FILTERS = {
  "This Week": 7,
  "This Month": 30,
  "This Year": 365,
};

type FilterKey = keyof typeof DATE_FILTERS;

export default function AnnouncementSection() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<FilterKey>("This Week");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  });
  const daysFromNow = DATE_FILTERS[activeTab];

  const { data: announcements, isLoading } = useQuery({
    queryKey: [
      "announcements",
      activeTab,
      pagination.pageIndex,
      pagination.pageSize,
      search,
    ],
    queryFn: () =>
      fetchAnnouncementsByDate(
        supabase,
        pagination.pageIndex,
        pagination.pageSize,
        search,
        daysFromNow,
      ),
  });

  const list: Tables<"announcement">[] = announcements?.data || [];
  const count = announcements?.count;

  return (
    <section className="flex flex-col gap-4" id="announcements">
      <div>
        <p className="font-medium">Announcements and Events</p>
        <p>
          View all events of the Guidance and Counseling Services, alongside
          external events and announcements
        </p>
      </div>
      <div className="flex items-center justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FilterKey)}
        >
          <TabsList>
            {Object.keys(DATE_FILTERS).map((label) => (
              <TabsTrigger key={label} value={label}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="w-fit bg-white px-2">
          <Search strokeWidth={1.25} />
          <InputGroupInput
            placeholder="Search by title"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </InputGroup>
      </div>
      {isLoading ? (
        <div className="grid h-[600px] grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <AnnouncementTile key={`skeleton-${idx}`} isLoading={true} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex h-[600px] w-full items-center justify-center gap-4 rounded-2xl border bg-white">
          <CircleOff strokeWidth={1.25} />
          <p>No events for this time period</p>
        </div>
      ) : (
        <div className="grid h-[600px] grid-cols-3 gap-4">
          {list.map((data, idx) => (
            <AnnouncementTile
              key={data.id || idx}
              announcementData={data}
              isLoading={false}
            />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <p>
          Showing {list.length} of {count} result(s)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.pageIndex === 0}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: Math.max(prev.pageIndex - 1, 0),
              }))
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            disabled={list.length < pagination.pageSize}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex + 1,
              }))
            }
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
