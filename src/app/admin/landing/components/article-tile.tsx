import { Article } from "@/lib/types/landing";
import { Calendar } from "lucide-react";
import Image from "next/image";

export default function ArticleTile({ articleTile }: { articleTile: Article }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-300">
      <div className="relative h-40 w-full">
        <Image
          src={
            articleTile.articleImage !== ""
              ? articleTile.articleImage
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
              articleTile.publishedAt.publisherIcon !== ""
                ? articleTile.publishedAt.publisherIcon
                : "/placeholder.png"
            }
            alt={articleTile.publishedAt.publisherName + "-icon"}
            width={64}
            height={64}
            className="rounded object-cover"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div>
          <p className="line-clamp-2 font-medium">{articleTile.title}</p>
          <p className="text-sm">by {articleTile.authorName}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
          <Calendar size={16} />
          <p>Archived {new Date(articleTile.addedAt).toDateString()}</p>
        </div>
      </div>
    </div>
  );
}
