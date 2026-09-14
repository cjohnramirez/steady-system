import Image from "next/image";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/app/brand-mark";
import { cn } from "@/lib/utils";

/**
 * The split card every auth page sits in: form on the left, photo on the right.
 *
 * Login, forgot-password and signup each had their own near-identical copy of this
 * layout, and signup's had no max width. The photo is decorative and hidden below
 * `md`, where it used to take 400px above the form on a phone.
 */
export function AuthShell({
  children,
  headerAction,
  wide = false,
}: {
  children: ReactNode;
  headerAction?: ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-4 py-6 md:py-10">
      <div
        className={cn(
          "bg-card flex w-full flex-col gap-8 rounded-3xl border p-5 sm:p-8 md:flex-row md:rounded-4xl",
          wide ? "max-w-7xl" : "max-w-6xl",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-col",
            wide ? "md:w-3/5" : "md:w-1/2",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BrandMark />
            {headerAction}
          </div>
          <div className="flex flex-1 flex-col justify-center py-8 md:py-12">
            {children}
          </div>
        </div>
        <div
          className={cn(
            "relative hidden min-h-[560px] md:block",
            wide ? "md:w-2/5" : "md:w-1/2",
          )}
        >
          <Image
            src="/auth.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 50vw, 0px"
            className="rounded-3xl object-cover"
          />
        </div>
      </div>
    </main>
  );
}

export function AuthHeading({
  title,
  description,
}: {
  title: string;
  description: ReactNode;
}) {
  return (
    <div className="mb-8 space-y-2 text-center">
      <h1 className="text-3xl tracking-tight md:text-4xl">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
