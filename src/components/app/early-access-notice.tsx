import { InfoCallout } from "@/components/app/info-callout";
import { BRAND } from "@/lib/brand";

/**
 * Tells visitors the site is still being built, that its content is sample data,
 * and that it isn't tied to any university. Shown above the home hero and at the
 * top of the mobile menu; `compact` shortens the copy for the narrow menu.
 */
export function EarlyAccessNotice({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <InfoCallout title="Early access" className={className}>
      {compact
        ? `${BRAND.name} is still being built. Content is sample data, and ${BRAND.name} isn't affiliated with any university.`
        : `${BRAND.name} is still being built. Some features may change or not work yet, the content here is sample data, and ${BRAND.name} isn't affiliated with any university.`}
    </InfoCallout>
  );
}
