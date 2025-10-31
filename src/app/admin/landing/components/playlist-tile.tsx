import { PlaylistWithEmotionalStatus } from "@/types/main";
import Image from "next/image";

export default function PlaylistTile({
  playlistData,
}: {
  playlistData: PlaylistWithEmotionalStatus;
}) {
  return (
    <div className="flex w-full flex-row gap-4 overflow-hidden rounded-2xl border border-gray-300 p-4">
      <div className="relative w-1/3">
        <Image
          src={
            playlistData.image && playlistData.image !== ""
              ? playlistData.image
              : "/placeholder.png"
          }
          alt={playlistData.title + "-image"}
          fill
          className="rounded-2xl object-cover"
          sizes="100vw"
        />
      </div>
      <div className="flex flex-col justify-between gap-4">
        <div>
          <p className="font-medium">{playlistData.title}</p>
          <p>by {playlistData.creator}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <p>{playlistData.emotional_status?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
