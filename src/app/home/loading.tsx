import { Skeleton } from "@/components/ui/skeleton";

/**
 * The home page's shape while its content loads on the server, so clicking the
 * logo shows the page straight away instead of nothing until everything arrives.
 * Uses the page's own grid classes, so it stacks the same way on a phone.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-24 pb-24 md:gap-32" aria-busy>
      <div className="flex flex-col gap-8 pt-10 md:pt-16">
        <Skeleton className="h-20 rounded-xl" />
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          <div className="w-full max-w-3xl space-y-5">
            <Skeleton className="h-12 w-11/12 sm:h-14" />
            <Skeleton className="h-12 w-3/5 sm:h-14" />
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-5 w-4/5 max-w-lg" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <Skeleton className="h-48 w-full rounded-2xl lg:max-w-sm" />
        </div>
        <Skeleton className="aspect-[16/9] w-full rounded-3xl md:aspect-[21/8] md:rounded-4xl" />
      </div>

      <div className="flex flex-col gap-10">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="grid auto-rows-[16rem] gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="rounded-3xl md:col-span-2 lg:row-span-2" />
          <Skeleton className="rounded-3xl md:col-span-2" />
          <Skeleton className="rounded-3xl" />
          <Skeleton className="rounded-3xl" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="bg-card space-y-3 rounded-2xl border p-2">
            <Skeleton className="aspect-[16/10] rounded-xl" />
            <div className="space-y-2 px-2 pb-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
