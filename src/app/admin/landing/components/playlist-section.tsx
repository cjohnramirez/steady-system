"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CircleOff,
  Plus,
  Search,
} from "lucide-react";
import PlaylistTile from "./playlist-tile";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { fetchPlaylist } from "../actions";
import { useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import PlaylistAddModal from "./playlist-add-modal";

export default function PlaylistSection() {
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 4,
  });

  const [openAddPlaylist, setOpenAddPlaylist] = useState(false);

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["playlists", pagination.pageIndex, pagination.pageSize, search],
    queryFn: () =>
      fetchPlaylist(
        supabase,
        pagination.pageIndex,
        pagination.pageSize,
        search,
      ),
  });

  const list = playlists?.data || [];
  const count = playlists?.count;

  return (
    <>
      {openAddPlaylist && (
        <PlaylistAddModal open={openAddPlaylist} setOpen={setOpenAddPlaylist} />
      )}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Playlists</p>
            <p>Browse and manage your playlists</p>
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
            <Button onClick={() => setOpenAddPlaylist(true)} variant="outline">
              <Plus /> Add Playlist
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <PlaylistTile key={`skeleton-${idx}`} isLoading />
            ))}
          </div>
        ) : list.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {list.map((playlist, idx) => (
              <PlaylistTile key={playlist.id || idx} playlistTile={playlist} />
            ))}
          </div>
        ) : (
          <div className="flex h-[150px] w-full items-center justify-center gap-4 rounded-2xl border bg-white">
            <CircleOff strokeWidth={1.25} />
            <p>No playlists found</p>
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
