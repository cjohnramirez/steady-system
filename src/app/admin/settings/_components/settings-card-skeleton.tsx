import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder in the shape of a settings SectionCard: title, description, a grid
 * of fields and a right-aligned save button. The settings layout (header and nav)
 * stays rendered around it while the sub-route loads.
 */
export function SettingsCardSkeleton({
  fields = 4,
  columns = 2,
}: {
  fields?: number;
  columns?: 1 | 2;
}) {
  return (
    <div
      aria-hidden
      className="bg-card flex flex-col gap-6 rounded-2xl border p-5 md:p-8"
    >
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div
        className={columns === 2 ? "grid gap-4 md:grid-cols-2" : "grid gap-4"}
      >
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
