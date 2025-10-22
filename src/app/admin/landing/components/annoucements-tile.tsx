import { Announcements } from "@/lib/types/landing";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";

export default function AnnoucementsTile({
  announcements,
}: {
  announcements: Announcements;
}) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-300 overflow-hidden">
      <div className="relative h-40 w-full">
        <Image
          src={
            announcements.annoucementImage !== ""
              ? announcements.annoucementImage
              : "/placeholder.png"
          }
          alt={announcements.title + "-image"}
          fill
          className="rounded-t-2xl object-cover"
          sizes="100vw"
        />
      </div>
      <div className="flex flex-col flex-1 justify-between gap-4 p-4">
        <div>
          <p className="font-medium">{announcements.title}</p>
          <p className="text-sm">{announcements.description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <Calendar size={16} />
            <p>Archived {new Date(announcements.startDate).toDateString()}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <MapPin size={16} />
            <p>{new Date(announcements.startDate).toDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
