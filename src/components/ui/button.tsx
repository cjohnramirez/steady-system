import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[25px] text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-primary text-primary-foreground shadow-steady-pill hover:bg-brand-hover",
        positive:
          "border border-transparent bg-positive text-positive-foreground shadow-steady-pill hover:opacity-95",
        destructive:
          "border border-transparent bg-destructive text-destructive-foreground shadow-steady-pill hover:opacity-95 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-border bg-card text-foreground shadow-steady-card hover:bg-muted dark:bg-card dark:hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline rounded-md active:scale-100",
      },
      size: {
        default: "h-12 px-5 text-[15px] has-[>svg]:px-5",
        sm: "h-12 gap-2 px-5 text-[15px] has-[>svg]:px-5",
        lg: "h-12 px-6 text-[15px] has-[>svg]:px-5",
        icon: "size-12 rounded-full",
        "icon-sm": "size-12 rounded-full",
        "icon-lg": "size-12 rounded-full",
        cta: "h-12 px-6 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && "disabled:opacity-75 [&>[data-slot=spinner]+svg]:hidden",
      )}
      {...props}
    >
      {loading && <Spinner data-slot="spinner" aria-hidden />}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
