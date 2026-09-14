"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Home,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrandMark } from "@/components/app/brand-mark";
import { UserAvatar } from "@/components/app/user-avatar";
import { NotificationBell } from "@/components/notification-bell";
import { useSignedInViewer } from "@/components/viewer-provider";
import { useSignOut } from "@/hooks/use-sign-out";
import { pathHasPrefix } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { name: "Dashboard", link: "/admin/dashboard" },
  { name: "Accounts", link: "/admin/accounts" },
  { name: "Appointments", link: "/admin/appointments" },
  { name: "Landing page", link: "/admin/landing" },
  { name: "Settings", link: "/admin/settings" },
];

export default function NavigationBar() {
  const pathname = usePathname();
  const viewer = useSignedInViewer();
  const signOut = useSignOut();
  const fullName =
    `${viewer.firstName} ${viewer.lastName}`.trim() || viewer.userName;

  return (
    <header className="bg-card sticky top-0 z-40 border-b">
      <div className="m-auto flex max-w-[1600px] flex-col gap-4 px-4 pt-4 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <BrandMark href="/admin/dashboard" />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 px-2">
                  <UserAvatar name={fullName} src={viewer.avatar} size="xs" />
                  <span className="max-w-40 truncate">{viewer.userName}</span>
                  <ChevronDown aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate font-medium">{fullName}</p>
                  <p className="text-muted-foreground text-xs">Administrator</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings/account">
                    <Settings aria-hidden />
                    Account settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/home">
                    <Home aria-hidden />
                    Public site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut aria-hidden />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell userId={viewer.userId} />
            <DropdownMenu modal={false}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="About this system"
                    >
                      <BookOpen />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>About this system</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/misc/meet-the-developers">
                    Meet the developers
                    <ArrowUpRight aria-hidden className="ml-auto" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/misc/privacy-policy">
                    Privacy policy
                    <ArrowUpRight aria-hidden className="ml-auto" />
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <nav
          aria-label="Admin sections"
          className="-mb-px flex gap-6 overflow-x-auto"
        >
          {SECTIONS.map((section) => {
            const active =
              pathHasPrefix(pathname, section.link) ||
              (pathname === "/admin" && section.link === "/admin/dashboard");

            return (
              <Link
                key={section.link}
                href={section.link}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-3 whitespace-nowrap transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent",
                )}
              >
                {section.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
