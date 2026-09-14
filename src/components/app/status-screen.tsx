import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BrandMark } from "@/components/app/brand-mark";

/** Full-page message for 404s, error boundaries and the /error route. */
export function StatusScreen({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <main className="bg-background flex min-h-dvh flex-col items-center justify-between gap-10 px-4 py-10">
      <div className="my-auto flex max-w-md flex-col items-center gap-6 text-center">
        <Icon aria-hidden className="size-16" strokeWidth={0.75} />
        <h1 className="text-4xl tracking-tight md:text-5xl">{title}</h1>
        <div className="text-muted-foreground">{description}</div>
        {children && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {children}
          </div>
        )}
      </div>
      <BrandMark />
    </main>
  );
}
