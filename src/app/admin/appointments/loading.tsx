import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAppointments() {
  return (
    <div className="h-[calc(100vh-250px)]">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="bg-muted h-10 w-[300px] rounded-md" />
        <div className="flex gap-4">
          <Skeleton className="bg-muted h-10 w-[300px] rounded-md" />
          <Skeleton className="bg-muted h-10 w-20 rounded-md" />
          <Skeleton className="bg-muted h-10 w-20 rounded-md" />
        </div>
      </div>
      <div className="h-full">
        <Skeleton className="h-full w-full rounded-md" />
      </div>
    </div>
  );
}
