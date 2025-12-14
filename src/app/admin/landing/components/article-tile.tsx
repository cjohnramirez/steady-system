"use client";

import { Tables } from "@/types/supabase";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import ArticleUpdateModal from "./article-update-modal";
import { CldImage } from "next-cloudinary";

export default function ArticleTile({
  articleTile,
  isLoading = false,
}: {
  articleTile?: Tables<"article">;
  isLoading?: boolean;
}) {
  const [openUpdateArticle, setOpenUpdateArticle] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white p-2">
        <Skeleton className="h-40 w-full rounded-t-2xl" />
        <div className="flex flex-1 flex-col justify-between gap-4 p-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!articleTile) return null;

  return (
    <>
      {openUpdateArticle && (
        <ArticleUpdateModal
          open={openUpdateArticle}
          setOpen={setOpenUpdateArticle}
          id={articleTile.id}
        />
      )}
      <div
        className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white hover:bg-gray-100/40"
        onClick={() => setOpenUpdateArticle(true)}
      >
        <div className="relative h-40 w-full">
          {articleTile.article_image?.length ? (
            <CldImage
              src={articleTile.article_image}
              alt={`${articleTile.title}-image`}
              fill
              className="rounded-2xl object-cover border"
              sizes="100vw"
            />
          ) : (
            <Image
              src="/placeholder.png"
              alt="placeholder"
              fill
              className="rounded-2xl object-cover border"
              sizes="100vw"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between gap-4 p-4">
          <div>
            <p className="line-clamp-2 font-medium">{articleTile.title}</p>
            <p className="text-sm">by {articleTile.author_name}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <Calendar size={16} />
            <p>
              Archived on{" "}
              {articleTile.added_at &&
                new Date(articleTile.added_at).toDateString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
