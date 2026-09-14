"use client";

import { useState } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";

/**
 * Something failed to load. Shown in place of the content, with a way to try again.
 *
 * Failed loads used to fall through to the empty state or to zeros, so a network
 * error on the dashboard read as "no students" and a broken appointment list read
 * as "nothing to do today".
 */
export function ErrorState({
  title = "This couldn't be loaded",
  description = "Check your connection and try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => unknown;
  className?: string;
}) {
  const [retrying, setRetrying] = useState(false);

  return (
    <EmptyState
      icon={TriangleAlert}
      title={title}
      description={description}
      className={className}
      action={
        onRetry && (
          <Button
            variant="outline"
            size="sm"
            loading={retrying}
            onClick={async () => {
              setRetrying(true);
              try {
                await onRetry();
              } finally {
                setRetrying(false);
              }
            }}
          >
            <RotateCw aria-hidden />
            Try again
          </Button>
        )
      }
    />
  );
}
