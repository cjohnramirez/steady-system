import { Tables } from "@/types/supabase";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleTile({
  articleTile,
  isLoading = false,
}: {
  articleTile?: Tables<"article_with_details">;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl w-full border border-gray-300">
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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-300">
      <div className="relative h-40 w-full">
        <Image
          src={
            articleTile.article_image && articleTile.article_image !== ""
              ? articleTile.article_image
              : "/placeholder.png"
          }
          alt={articleTile.title + "-image"}
          fill
          className="rounded-t-2xl object-cover"
          sizes="100vw"
        />
        <div className="absolute top-3 right-3 flex items-center gap-2 rounded px-2 py-1">
          <Image
            src={
              articleTile.publisher_icon
                ? articleTile.publisher_icon
                : "/placeholder.png"
            }
            alt={articleTile.publisher_name + "-icon"}
            width={64}
            height={64}
            className="rounded object-cover"
          />
        </div>
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
  );
}
