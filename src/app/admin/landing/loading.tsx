import { ContentCardSkeleton } from "@/components/content/content-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-busy>
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-9 w-96" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
