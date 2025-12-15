"use client";

import { useQuery } from "@tanstack/react-query";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePicture() {
  const isLoading = false;

  return (
    <section className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-8">
      <div>
        <h2 className="mb-1 text-lg font-semibold">Organization Icon</h2>
        <p className="text-sm">
          Upload or update the organization icon. Click the icon to upload
          a new photo.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? (
          <Skeleton className="h-20 w-20 rounded-full" />
        ) : (
          <div className="from-brand-light to-brand-normal relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-t">
            <div className="absolute right-0 bottom-0 cursor-pointer rounded-full border border-gray-200 bg-white p-2">
              <Edit2
                onClick={() => toast.info("This is an upcoming feature")}
                size={20}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
