"use client";

import { ChevronsUpDown, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/**
 * Light, dark or follow the device. The icon swaps with CSS on the `dark` class
 * rather than from `resolvedTheme`, which is unknown during server rendering and
 * would flash the wrong icon.
 */
export function ThemeToggle({
  variant = "icon",
}: {
  variant?: "icon" | "row";
}) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {variant === "row" ? (
          <button
            type="button"
            aria-label="Change theme"
            className="hover:bg-muted focus-visible:ring-ring/50 flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-[30px] px-3 text-[14px] transition-colors outline-none focus-visible:ring-[3px]"
          >
            <span className="flex items-center gap-2.5">
              <Sun
                aria-hidden
                strokeWidth={1.5}
                className="text-muted-foreground size-4 dark:hidden"
              />
              <Moon
                aria-hidden
                strokeWidth={1.5}
                className="text-muted-foreground hidden size-4 dark:block"
              />
              <span className="text-foreground">Appearance</span>
            </span>
            <span className="text-muted-foreground flex items-center gap-1 text-[13px]">
              <span className="dark:hidden">Light</span>
              <span className="hidden dark:inline">Dark</span>
              <ChevronsUpDown
                aria-hidden
                strokeWidth={1.5}
                className="size-3.5"
              />
            </span>
          </button>
        ) : (
          <Button variant="outline" size="icon" aria-label="Theme">
            <Sun strokeWidth={1.5} className="dark:hidden" />
            <Moon strokeWidth={1.5} className="hidden dark:block" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === "row" ? "start" : "end"}
        className="min-w-48"
      >
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon aria-hidden strokeWidth={1.5} />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
