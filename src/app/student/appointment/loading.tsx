import { Skeleton } from "@/components/ui/skeleton";

/** Page header and the booking form's two cards. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6 md:gap-8" aria-busy>
      <div className="space-y-2">
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-[28rem] max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
