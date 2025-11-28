"use client";

import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { fetchAnnouncementsByDate, fetchPlaylistByEmotion } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Tables } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import AnnouncementTile from "./announcement-tile";
import { useUserStore } from "@/hooks/auth-store";
import Link from "next/link";
import PlaylistTile from "./playlist-tile";

export default function PlaylistSection() {
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const userEmotionalStatus = useUserStore().emotionalStatus;

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["playlist", search],
    queryFn: () =>
      fetchPlaylistByEmotion(supabase, search, userEmotionalStatus),
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
            <Link href="student/profile/">
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
      <div className="grid h-[160px] grid-cols-3 gap-4">
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
      </div>
    </section>
  );
}
