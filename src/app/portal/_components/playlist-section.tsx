"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchPlaylistByEmotion } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Tables } from "@/types/supabase";
import { useUserStore } from "@/hooks/auth-store";
import Link from "next/link";
import PlaylistTile from "./playlist-tile";
import { PaginationState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export default function PlaylistSection() {
  const supabase = createClient();
  const userEmotionalStatus = useUserStore().emotionalStatus;

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  });

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["playlist", pagination.pageIndex, pagination.pageSize, search, userEmotionalStatus],
    queryFn: () =>
      fetchPlaylistByEmotion(
        supabase,
        pagination.pageIndex,
        pagination.pageSize,
        search,
        userEmotionalStatus,
      ),
  });

  const list: Tables<"playlist_with_details">[] = playlists?.data || [];
  const count = playlists?.count;

  return (
    <section className="flex flex-col gap-4" id="playlists">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Playlists</p>
          <p>
            View all music playlists, curated based on your emotional status
            (you can change it{" "}
            <Link href="student/">
              <u className="cursor-pointer">here</u>
            </Link>
            )
          </p>
        </div>
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
      <div className="grid grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <PlaylistTile key={`skeleton-${idx}`} isLoading={true} />
            ))
          : list.map((data, idx) => (
              <PlaylistTile
                key={data.id || idx}
                playlistData={data}
                isLoading={false}
              />
            ))}
      </div>
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
