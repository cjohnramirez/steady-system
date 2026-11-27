import { Skeleton } from "@/components/ui/skeleton";
import { ContentCardSkeleton } from "@/components/content/content-card";

/** The portal's featured tiles and first content grids while they load. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-12 md:gap-16" aria-busy>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="space-y-3 py-4">
            <Skeleton className="h-12 w-48 md:h-16" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
          <Skeleton className="min-h-72 rounded-3xl md:min-h-96" />
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-[74px] rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="min-h-72 flex-1 rounded-3xl" />
        </div>
      </div>

      {Array.from({ length: 2 }, (_, section) => (
        <div key={section} className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <Skeleton className="h-9 w-full sm:w-44" />
              <Skeleton className="h-9 w-full sm:w-72" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <ContentCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
