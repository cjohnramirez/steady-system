"use client";

import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { fetchAnnouncements } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  ChevronLeft,
  ChevronRight,
  CircleOff,
  Plus,
  Search,
} from "lucide-react";
import { Tables } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import AnnoucementTile from "./annoucements-tile";
import AnnouncementAddModal from "./announcement-add-modal";
import AnnouncementUpdateModal from "./announcement-update-modal";

export default function AnnouncementSection() {
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 4,
  });

  const [openAddAnnouncement, setOpenAddAnnouncement] = useState(false);

  const { data: announcementData, isLoading } = useQuery({
    queryKey: [
      "announcements",
      pagination.pageIndex,
      pagination.pageSize,
      search,
    ],
    queryFn: () =>
      fetchAnnouncements(
        supabase,
        pagination.pageIndex,
        pagination.pageSize,
        search,
      ),
  });

  const list: Tables<"announcement">[] = announcementData?.data || [];
  const count = announcementData?.count;

  return (
    <>
      {openAddAnnouncement && (
        <AnnouncementAddModal
          open={openAddAnnouncement}
          setOpen={setOpenAddAnnouncement}
        />
      )}
      <section className="flex flex-col gap-4" id="announcements">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Announcements</p>
            <p>Added announcements here are shown in the landing page</p>
          </div>
          <div className="flex gap-4">
            <InputGroup className="w-fit bg-white px-2">
              <Search strokeWidth={1.25} />
              <InputGroupInput
                placeholder="Search by title"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </InputGroup>
            <Button
              onClick={() => setOpenAddAnnouncement(true)}
              variant="outline"
            >
              <Plus /> Add Announcement
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="grid h-[300px] grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <AnnoucementTile key={`skeleton-${idx}`} isLoading={true} />
            ))}
          </div>
        ) : list.length > 0 ? (
          <div className="grid h-[300px] grid-cols-4 gap-4">
            {list.map((announcement, idx) => (
              <AnnoucementTile
                key={announcement.id || idx}
                annoucementTile={announcement}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-[300px] w-full items-center justify-center gap-4 rounded-2xl border bg-white">
            <CircleOff strokeWidth={1.25} />
            <p>No announcements found</p>
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
    </>
  );
}
