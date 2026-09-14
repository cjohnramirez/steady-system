import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Logo and office name, linking home. Was a clickable <section> in four places. */
export function BrandMark({
  href = "/home",
  label = "Guidance and Counseling Services",
  compactLabel = "GCS",
  className,
}: {
  href?: string;
  label?: string;
  compactLabel?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-visible:ring-ring/50 flex shrink-0 items-center gap-3 rounded-md outline-none focus-visible:ring-[3px]",
        className,
      )}
    >
      <Image src="/icon.png" alt="" width={40} height={40} priority />
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden">{compactLabel}</span>
    </Link>
  );
}
