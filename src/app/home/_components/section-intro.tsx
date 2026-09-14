import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The pill eyebrow, heading and lead paragraph that open each home section. */
export function SectionIntro({
  eyebrow,
  title,
  id,
  children,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  id: string;
  children?: ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center"
          ? "mx-auto items-center text-center"
          : "items-start text-left",
      )}
    >
      <span className="bg-card rounded-full border px-4 py-1.5 text-sm">
        {eyebrow}
      </span>
      <h2 id={id} className="text-3xl tracking-tight md:text-4xl">
        {title}
      </h2>
      {children && (
        <div className="text-muted-foreground space-y-3">{children}</div>
      )}
    </div>
  );
}
