"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import ArticleTile from "./components/article-tile";
import AnnoucementTile from "./components/annoucements-tile";
import PlaylistTile from "./components/playlist-tile";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchArticles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("article_with_details")
    .select(`*`)
    .range(0, 3);

  if (error) throw error;
  return data || [];
}

async function fetchPlaylist(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("playlist_with_details")
    .select(`*`)
    .range(0, 3);

  if (error) throw error;
  return data || [];
}

async function fetchAnnouncements(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("announcement")
    .select(`*`)
    .range(0, 3);

  if (error) throw error;
  return data || [];
}

export default function LandingPage() {
  const supabase = createClient();

  const { data: articleData = [], isLoading: articleDataLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: () => fetchArticles(supabase),
  });

  const { data: annoucementData = [], isLoading: annoucementDataLoading } =
    useQuery({
      queryKey: ["annoucements"],
      queryFn: () => fetchAnnouncements(supabase),
    });

  const { data: playlistData = [], isLoading: playlistDataLoading } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => fetchPlaylist(supabase),
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between">
        <div>
          <h2 className="text-md font-semibold">Articles to Read</h2>
          <p className="">Added articles here are shown in the landing page</p>
        </div>
        <Button variant={"outline"}>
          <Plus />
          Add Article
        </Button>
      </div>
      <div className="flex h-full items-stretch justify-center gap-4">
        <div className="grid w-full grid-cols-4 place-items-stretch gap-4">
          {articleDataLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <ArticleTile key={idx} isLoading />
              ))
            : articleData
                .slice(0, 4)
                .map((article, idx) => (
                  <ArticleTile key={idx} articleTile={article} />
                ))}
        </div>
        <div className="flex h-auto items-stretch">
          <Button
            variant={"outline"}
            className="flex h-full flex-col justify-center py-8"
          >
            <ChevronRight />
            See More
          </Button>
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <h2 className="text-md font-semibold">Announcements and Events</h2>
          <p className="">
            Added announcements and events are shown in the landing page
          </p>
        </div>
        <Button variant={"outline"}>
          <Plus />
          Add Annoucements / Events
        </Button>
      </div>
      <div className="flex h-full items-stretch justify-center gap-4">
        <div className="grid w-full grid-cols-4 place-content-stretch gap-4">
          {annoucementDataLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <AnnoucementTile key={idx} isLoading />
              ))
            : annoucementData
                .slice(0, 4)
                .map((annoucement, idx) => (
                  <AnnoucementTile annoucementTile={annoucement} key={idx} />
                ))}
        </div>
        <div className="flex h-auto items-stretch">
          <Button
            variant={"outline"}
            className="flex h-full flex-col justify-center py-8"
          >
            <ChevronRight />
            See More
          </Button>
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <h2 className="text-md font-semibold">Music Recommendations</h2>
          <p className="">Added music recommendations</p>
        </div>
        <Button variant={"outline"}>
          <Plus />
          Add Playlist
        </Button>
      </div>
      <div className="flex h-full items-stretch justify-center gap-4">
        <div className="grid w-full grid-cols-4 place-content-stretch gap-4">
          {playlistDataLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <PlaylistTile key={idx} isLoading />
              ))
            : playlistData
                .slice(0, 4)
                .map((playlist, idx) => (
                  <PlaylistTile playlistTile={playlist} key={idx} />
                ))}
        </div>
        <div className="flex h-auto items-stretch">
          <Button
            variant={"outline"}
            className="flex h-full flex-col justify-center py-8"
          >
            <ChevronRight />
            See More
          </Button>
        </div>
      </div>
    </div>
  );
}
