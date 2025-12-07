"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/types/supabase";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import AnnouncementUpdateModal from "./announcement-update-modal";

export default function AnnoucementTile({
  annoucementTile,
  isLoading = false,
}: {
  annoucementTile?: Tables<"announcement">;
  isLoading?: boolean;
}) {
  const [openUpdateAnnouncement, setOpenUpdateAnnouncement] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white p-2">
        <Skeleton className="h-40 w-full rounded-t-2xl" />
        <div className="flex flex-1 flex-col justify-between gap-4 p-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!annoucementTile) return null;

  return (
    <>
      {openUpdateAnnouncement && (
        <AnnouncementUpdateModal
          open={openUpdateAnnouncement}
          setOpen={setOpenUpdateAnnouncement}
          id={annoucementTile.id}
        />
      )}
      <div
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white cursor-pointer"
        onClick={() => setOpenUpdateAnnouncement(true)}
      >
        <div className="relative h-40 w-full">
          <Image
            src={
              annoucementTile.announcement_image &&
              annoucementTile.announcement_image !== ""
                ? annoucementTile.announcement_image
                : "/placeholder.png"
            }
            alt={annoucementTile.title + "-image"}
            fill
            className="rounded-t-2xl object-cover"
            sizes="100vw"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-4 p-4">
          <div>
            <p className="line-clamp-1 font-medium">{annoucementTile.title}</p>
            <p className="line-clamp-2 text-sm">
              {annoucementTile.description}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
              <Calendar size={16} />
              <p>
                Archived {new Date(annoucementTile.start_date).toDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
              <MapPin size={16} />
              <p>{new Date(annoucementTile.end_date).toDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
