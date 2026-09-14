"use client";

import type { ReactNode } from "react";
import { useLinkStatus } from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Inside a `<Link>`: a spinner while that link's navigation is pending, otherwise
 * `children` (usually the link's icon). Clicking a link used to give no sign of
 * anything happening until the next page had fully loaded.
 */
export function LinkPending({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { pending } = useLinkStatus();
  if (!pending) return <>{children}</>;
  return <Spinner aria-hidden className={cn("shrink-0", className)} />;
}
