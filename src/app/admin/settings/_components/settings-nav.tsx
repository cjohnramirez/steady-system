"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin/settings/account", label: "Your account", icon: UserRound },
  { href: "/admin/settings/system", label: "Office details", icon: Building2 },
];

/**
 * The settings sections. The old sidebar also had a search box that filtered two
 * cards by title and rewrote the URL on every keystroke.
 */
export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings" className="flex gap-1 lg:flex-col">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              active
                ? "bg-card border font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon aria-hidden strokeWidth={1.5} className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
