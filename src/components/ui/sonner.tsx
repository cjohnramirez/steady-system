"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      // Follow the site's theme, not the device's, so a light choice on a dark
      // device doesn't get dark toasts.
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      className="toaster group font-sans"
      icons={{
        success: (
          <CircleCheckIcon
            strokeWidth={1.5}
            className="text-positive size-[18px] shrink-0"
          />
        ),
        info: (
          <InfoIcon
            strokeWidth={1.5}
            className="text-primary size-[18px] shrink-0"
          />
        ),
        warning: (
          <TriangleAlertIcon
            strokeWidth={1.5}
            className="size-[18px] shrink-0 text-amber-500"
          />
        ),
        error: (
          <OctagonXIcon
            strokeWidth={1.5}
            className="text-destructive size-[18px] shrink-0"
          />
        ),
        loading: (
          <Loader2Icon
            strokeWidth={1.5}
            className="text-primary size-[18px] shrink-0 animate-spin"
          />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "!bg-card !text-foreground !border !border-border !rounded-[20px] !shadow-steady-card !px-4 !py-3.5 !gap-3 !font-sans !text-[14px]",
          title: "!font-medium !text-[14px] !text-foreground !leading-snug",
          description: "!text-[13px] !text-muted-foreground !leading-snug",
          actionButton:
            "!bg-primary !text-primary-foreground !rounded-full !px-3.5 !py-1.5 !text-[13px] !font-medium !shadow-steady-pill",
          cancelButton:
            "!bg-card !text-foreground !border !border-border !rounded-full !px-3.5 !py-1.5 !text-[13px] !font-normal",
          closeButton:
            "!bg-card !border !border-border !text-muted-foreground hover:!text-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "20px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
