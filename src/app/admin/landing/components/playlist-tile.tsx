import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/types/supabase";
import Image from "next/image";

export default function PlaylistTile({
  playlistTile,
  isLoading = false,
}: {
  playlistTile?: Tables<"playlist_with_details">;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex w-full flex-row gap-4 overflow-hidden rounded-2xl p-2 border border-gray-300">
        <div className="relative w-1/3">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-full mb-2" />
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
    <div className="flex w-full flex-row gap-4 overflow-hidden rounded-2xl border border-gray-300 p-4">
      <div className="relative w-1/3">
        <Image
          src={
            playlistTile.image && playlistTile.image !== ""
              ? playlistTile.image
              : "/placeholder.png"
          }
          alt={playlistTile.title + "-image"}
          fill
          className="rounded-2xl object-cover"
          sizes="100vw"
        />
      </div>
      <div className="flex flex-col justify-between gap-4">
        <div>
          <p className="font-medium">{playlistTile.title}</p>
          <p>by {playlistTile.creator}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <p>{playlistTile.emotional_status_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
