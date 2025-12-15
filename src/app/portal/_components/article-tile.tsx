"use client";

import { Tables } from "@/types/supabase";
import { Info } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import ExternalLinkModal from "./external-link-modal";
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

export default function ArticleTile({
  articleData,
  isLoading,
}: {
  articleData?: Tables<"article">;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative h-64 justify-between">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>

        <div className="h-fit space-y-2 rounded-xl border border-gray-200 flex flex-col justify-start">
          <div className="space-y-2 p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex h-fit flex-col justify-start space-y-2 border-t border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-4 w-24" />
              </div>
            </div>
            <div className="mt-2">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!articleData) return null;

  return (
    <>
      {open && (
        <ExternalLinkModal
          open={open}
          setOpen={setOpen}
          url={articleData.link ?? ""}
        />
      )}
      <div
        className="flex h-full cursor-pointer flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4"
        onClick={() => setOpen(true)}
      >
        <div className="relative h-64 justify-between">
          {articleData.article_image?.length ? (
            <CldImage
              src={articleData.article_image}
              alt={`${articleData.title}-image`}
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
        <div className="h-fit space-y-2 rounded-xl border border-gray-200 flex flex-col justify-start">
          <div className="space-y-2 p-4">
            <p className="font-medium">{articleData.title}</p>
            <p>{articleData.content}</p>
          </div>
          <div className="flex h-fit flex-col justify-start space-y-2 border-t border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <Info
                className="rounded-full border border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">{articleData.publisher_name}</p>
                <p>{articleData.author_name}</p>
              </div>
            </div>
            <div className="mt-2">
              <p>
                Added on {formatAnnouncementDate(articleData.added_at ?? "")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
