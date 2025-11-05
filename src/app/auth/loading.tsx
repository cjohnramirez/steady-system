import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoadingSkeleton() {
  return (
    <div className="flex h-full min-h-screen w-full items-center overflow-y-auto p-4">
      <div className="flex h-full w-full flex-col gap-8 rounded-4xl border p-8 md:flex-row">
        {/* Left section */}
        <div className="flex flex-col justify-center md:w-1/2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-4xl" />
              <Skeleton className="h-5 w-8" />
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="my-10 flex flex-col justify-center px-10">
            <div className="w-full space-y-2 text-center">
              <Skeleton className="mx-auto h-8 w-48" />
              <Skeleton className="mx-auto h-6 w-72" />
            </div>
            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="mb-20 h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Right image */}
        <div className="relative h-[400px] md:h-auto md:w-1/2">
          <Skeleton className="h-full w-full rounded-4xl" />
        </div>
      </div>
    </div>
  );
}
