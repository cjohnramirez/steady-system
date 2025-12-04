import { Skeleton } from "@/components/ui/skeleton";
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
    return (
      <div className="flex h-full gap-2 rounded-x bg-white p-4">
        <div className="relative w-1/2 justify-between">
          <div className="h-full w-full rounded-2xl bg-gray-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full rounded-2xl">
                <Skeleton className="h-full w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/2 space-y-2 rounded-xl border border-gray-200">
          <div className="relative flex h-full flex-col justify-end p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Skeleton className="mb-2 h-5 w-32 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="absolute top-5 right-5 rounded-full">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
        <div className="relative flex h-full flex-col justify-end p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{playlistData.title}</p>
              <p>by {playlistData.creator}</p>
            </div>
            <ArrowUpRight
              className="absolute top-5 right-5 rounded-full border border-gray-200 p-2"
              size={40}
              strokeWidth={1.25}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
