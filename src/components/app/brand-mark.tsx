import Link from "next/link";
import { LinkPending } from "@/components/app/link-pending";
import { SteadyMark } from "@/components/app/steady-mark";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The official Steady icon + wordmark lockup (Figma 678:15857), linking home.
 */
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
        "focus-visible:ring-ring/50 flex shrink-0 items-center gap-4 rounded-xl outline-none focus-visible:ring-[3px]",
        className,
      )}
    >
      {/* While home loads, a spinner stands in for the mark. */}
      <LinkPending className="text-brand size-11 p-2.5">
        <SteadyMark className="size-11" />
      </LinkPending>
      <span className="text-foreground text-[20px] font-normal tracking-tight">
        {BRAND.name}
      </span>
    </Link>
  );
}
