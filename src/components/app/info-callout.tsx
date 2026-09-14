import type { ReactNode } from "react";
import { Info, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/** A note inside a card or dialog: what this screen does, or what to watch for. */
export function InfoCallout({
  title,
  children,
  variant = "default",
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}) {
  const Icon = variant === "destructive" ? TriangleAlert : Info;

  return (
    <Alert variant={variant} className={cn("rounded-xl", className)}>
      <Icon strokeWidth={1.5} />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
