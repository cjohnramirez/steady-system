import { Skeleton } from "@/components/ui/skeleton";
import { strToTitleCase } from "@/lib/format";
import { Tables } from "@/types/supabase";
import Image from "next/image";
import { useState } from "react";
import PlaylistUpdateModal from "./playlist-update-modal";
import { CldImage } from "next-cloudinary";

export default function PlaylistTile({
  playlistTile,
  isLoading = false,
}: {
  playlistTile?: Tables<"playlist_with_details">;
  isLoading?: boolean;
}) {
  const [openUpdatePlaylist, setOpenUpdatePlaylist] = useState(false);

  if (isLoading) {
    return (
      <div className="flex w-full flex-row gap-4 overflow-hidden rounded-2xl border border-gray-300 bg-white p-2">
        <div className="relative w-1/3">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <Skeleton className="mb-2 h-6 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!playlistTile) return null;

  return (
    <>
      {openUpdatePlaylist && (
        <PlaylistUpdateModal
          open={openUpdatePlaylist}
          setOpen={setOpenUpdatePlaylist}
          id={playlistTile.id ?? ""}
        />
      )}
      <div
        className="flex w-full cursor-pointer flex-row gap-4 overflow-hidden rounded-2xl border border-gray-300 bg-white p-4 hover:bg-gray-100/40"
        onClick={() => setOpenUpdatePlaylist(true)}
      >
        <div className="relative w-1/3">
          {playlistTile.image?.length ? (
            <CldImage
              src={playlistTile.image}
              alt={`${playlistTile.title}-image`}
              fill
              className="rounded-2xl border object-cover"
              sizes="100vw"
            />
          ) : (
            <Image
              src="/placeholder.png"
              alt="placeholder"
              fill
              className="rounded-2xl border object-cover"
              sizes="100vw"
            />
          )}
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className="font-medium">{playlistTile.title}</p>
            <p>by {playlistTile.creator}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
              <p>{strToTitleCase(playlistTile.emotional_status_name ?? "")}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
