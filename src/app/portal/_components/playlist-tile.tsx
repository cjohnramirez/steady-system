import { Tables } from "@/types/supabase";
import { ArrowUpRight, Clock2Icon, MapPin } from "lucide-react";
import Image from "next/image";

export default function PlaylistTile({
  playlistData,
  isLoading,
}: {
  playlistData?: Tables<"playlist_with_details">;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <></>;
  }

  if (!playlistData) return null;

  return (
    <div className="flex h-full gap-2 rounded-xl border border-gray-200 bg-white p-4">
      <div className="relative w-1/2 justify-between">
        <Image
          src="/placeholder.png"
          alt="placeholder"
          fill
          className="rounded-2xl object-cover"
        />
      </div>
      <div className="w-1/2 space-y-2 rounded-xl border border-gray-200">
        <div className="flex h-full flex-col justify-end relative p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{playlistData.title}</p>
              <p>by {playlistData.creator}</p>
            </div>
            <ArrowUpRight
              className="rounded-full border-1 border-gray-200 p-2 absolute top-5 right-5"
              size={40}
              strokeWidth={1.25}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
