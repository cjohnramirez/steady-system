"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin/settings/system", label: "Office & System" },
  { href: "/admin/settings/account", label: "Account Settings" },
];

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="bg-card border-border shadow-steady-card inline-flex h-[50px] items-center rounded-[30px] border p-1"
    >
      {ITEMS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-full items-center justify-center rounded-[30px] px-5 text-[15px] transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-[inset_4px_4px_8.1px_0px_rgba(255,255,255,0.45)]"
                : "text-foreground hover:bg-muted/60",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
