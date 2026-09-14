import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder with the same rhythm as an auth form: heading, fields, button. */
export function AuthFormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
