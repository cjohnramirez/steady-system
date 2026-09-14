import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-busy>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-[32rem] rounded-2xl" />
    </div>
  );
}
