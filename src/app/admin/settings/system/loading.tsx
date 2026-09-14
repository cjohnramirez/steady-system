import { SettingsCardSkeleton } from "../_components/settings-card-skeleton";

/** Office details card and contact links card. */
export default function Loading() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy
      aria-label="Loading office details"
    >
      <SettingsCardSkeleton fields={8} />
      <SettingsCardSkeleton fields={2} />
    </div>
  );
}
