import { Tables } from "@/types/supabase";
import { Clock2Icon, MapPin } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { CldImage } from "next-cloudinary";

export function formatAnnouncementDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnnouncementTile({
  announcementData,
  isLoading,
}: {
  announcementData?: Tables<"announcement">;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative h-1/2 w-full">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
        <div className="flex h-1/2 flex-col justify-between rounded-xl border border-gray-200">
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="space-y-2 border-t border-gray-200 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!announcementData) return null;

  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
      <div className="relative h-1/2 justify-between">
        {announcementData.announcement_image?.length ? (
          <CldImage
            src={announcementData.announcement_image}
            alt={`${announcementData.title}-image`}
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
      <div className="h-1/2 space-y-2 rounded-xl border border-gray-200">
        <div className="space-y-2 p-4">
          <div className="flex items-center gap-4">
            <MapPin
              className="rounded-full border border-gray-200 p-2"
              size={40}
              strokeWidth={1.25}
            />
            <p>{announcementData.location}</p>
          </div>
          <div className="flex items-center gap-4">
            <Clock2Icon
              className="rounded-full border border-gray-200 p-2"
              size={40}
              strokeWidth={1.25}
            />
            <p>{formatAnnouncementDate(announcementData.start_date)}</p>
          </div>
        </div>
        <div className="space-y-2 border-t border-gray-200 p-4">
          <p className="font-medium">{announcementData.title}</p>
          <p className="line-clamp-2">{announcementData.description}</p>
        </div>
      </div>
    </div>
  );
}
