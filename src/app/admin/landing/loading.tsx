import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingLanding() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="bg-muted h-10 w-[300px] rounded-md" />
          <div className="flex gap-4">
            <Skeleton className="bg-muted h-10 w-[130px] rounded-md" />
          </div>
        </div>
        <div className="flex h-72 gap-4">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-[100px]" />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="bg-muted h-10 w-[300px] rounded-md" />
          <div className="flex gap-4">
            <Skeleton className="bg-muted h-10 w-[130px] rounded-md" />
          </div>
        </div>
        <div className="flex h-72 gap-4">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-[100px]" />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="bg-muted h-10 w-[300px] rounded-md" />
          <div className="flex gap-4">
            <Skeleton className="bg-muted h-10 w-[130px] rounded-md" />
          </div>
        </div>
        <div className="flex h-72 gap-4">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-[100px]" />
        </div>
      </div>
    </div>
  );
}
