import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 md:gap-8" aria-busy>
      <div className="space-y-2">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 md:gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-4 md:gap-6">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <Skeleton className="h-[40rem] rounded-2xl" />
      </div>
    </div>
  );
}
