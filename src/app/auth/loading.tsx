import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoadingSkeleton() {
  return (
    <div className="flex h-screen p-4">
      <div className="flex w-full gap-8 rounded-4xl border p-8">
        <div className="flex w-1/2 flex-col justify-center">
          <div className="flex items-center gap-3 justify-between w-full">
            <div className="flex items-center gap-3 w-full">
              <Skeleton className="h-10  w-1/2 rounded-4xl" />
              <Skeleton className="h-10 w-20 rounded-4xl" />
            </div>
          </div>
          <div className="flex h-full flex-col justify-center px-30">
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
              <Skeleton className="h-10 w-full mb-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <div className="relative w-1/2">
          <Skeleton className="h-full w-full rounded-4xl" />
        </div>
      </div>
    </div>
  );
}