import Link from "next/link";
import type { roles } from "@/types/main";
import { cn } from "@/lib/utils";

const TABS: { role: roles; label: string }[] = [
  { role: "student", label: "Student" },
  { role: "counselor", label: "Counselor" },
  { role: "admin", label: "Admin" },
];

/**
 * Figma Login Section role pill switcher.
 */
export default function LoginTabs({ activeRole }: { activeRole: roles }) {
  return (
    <nav
      aria-label="Log in as"
      className="bg-card border-border shadow-steady-card inline-flex w-full items-center gap-1 rounded-[30px] border p-1.5"
    >
      {TABS.map((tab) => {
        const active = tab.role === activeRole;
        return (
          <Link
            key={tab.role}
            href={`/auth/login/${tab.role}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring/50 flex-1 rounded-[25px] px-4 py-2.5 text-center text-[15px] transition-colors outline-none focus-visible:ring-[3px]",
              active
                ? "bg-primary text-primary-foreground shadow-steady-pill font-medium"
                : "text-foreground/80 hover:bg-muted font-normal",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
