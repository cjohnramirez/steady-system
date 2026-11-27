import Link from "next/link";
import { LinkPending } from "@/components/app/link-pending";
import { SteadyMark } from "@/components/app/steady-mark";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** The Lean mark and product name, linking home. */
export function BrandMark({
  href = "/home",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-visible:ring-ring/50 flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px]",
        className,
      )}
    >
      {/* While home loads, a spinner stands in for the mark. */}
      <LinkPending className="text-brand size-9 p-2">
        <SteadyMark />
      </LinkPending>
      <span className="text-lg font-medium tracking-tight">{BRAND.name}</span>
    </Link>
  );
}
