import { SettingsCardSkeleton } from "../_components/settings-card-skeleton";

/** Profile card (five fields) and password card (two fields). */
export default function Loading() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy
      aria-label="Loading account settings"
    >
      <SettingsCardSkeleton fields={5} />
      <SettingsCardSkeleton fields={2} />
    </div>
  );
}
