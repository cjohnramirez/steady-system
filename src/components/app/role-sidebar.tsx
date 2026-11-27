"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as m from "motion/react-m";
import {
  EyeOff,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/app/brand-mark";
import { SteadyMark } from "@/components/app/steady-mark";
import { UserAvatar } from "@/components/app/user-avatar";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePrivacyShield } from "@/components/app/privacy-shield";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSignOut } from "@/hooks/use-sign-out";
import { steadyTransitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface SidebarNavItemDef {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  exact?: boolean;
}

export interface SidebarNavGroupDef {
  title: string;
  items: readonly SidebarNavItemDef[];
}

export interface RoleSidebarProps {
  roleLabel: string;
  userId: string;
  userName: string;
  userSubtitle: string;
  userAvatar?: string | null;
  groups: readonly SidebarNavGroupDef[];
  topSlot?: ReactNode;
  footerSlot?: ReactNode;
  privacyLabel?: string;
  children: ReactNode;
}

/**
 * Unified collapsible RoleSidebar matching Figma's 345px / 114px sidebars on
 * desktop (`lg+`) and morphing into a sticky topbar + Radix Sheet drawer below `lg`.
 */
export function RoleSidebarShell({
  roleLabel,
  userId,
  userName,
  userSubtitle,
  userAvatar,
  groups,
  topSlot,
  footerSlot,
  privacyLabel = "Enable Campus Privacy",
  children,
}: RoleSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { enabled: privacyOn, toggle: togglePrivacy } = usePrivacyShield();
  const signOut = useSignOut();

  const isActive = (item: SidebarNavItemDef) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const renderNavContent = (isCompact: boolean, closeMobile?: () => void) => (
    <div className="flex h-full flex-col justify-between gap-6">
      <div className="flex flex-col gap-7">
        {/* Brand header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SteadyMark className="size-9 shrink-0" />
            {!isCompact && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[16px] font-medium">Steady</p>
                <p className="text-muted-foreground truncate text-sm">
                  {roleLabel}
                </p>
              </div>
            )}
          </div>
          {!isCompact && <NotificationBell userId={userId} />}
        </div>

        {/* Optional role-specific top controls (e.g., Counselor Duty Status) */}
        {!isCompact && topSlot}

        {/* Navigation Groups */}
        <nav
          aria-label={`${roleLabel} navigation`}
          className="flex flex-col gap-6"
        >
          {groups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2.5">
              {!isCompact && (
                <p className="text-muted-foreground px-3 text-xs font-medium tracking-wide uppercase">
                  {group.title}
                </p>
              )}
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMobile}
                        title={isCompact ? item.label : undefined}
                        className={cn(
                          "relative flex h-10 items-center gap-3.5 rounded-[30px] px-3.5 text-[15px] transition-colors",
                          isCompact && "justify-center px-0",
                          active
                            ? "text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-muted",
                        )}
                      >
                        {active && (
                          <m.span
                            layoutId={`sidebar-active-${roleLabel}`}
                            transition={steadyTransitions.tabIndicator}
                            className="bg-sidebar-accent absolute inset-0 rounded-[30px]"
                          />
                        )}
                        <Icon
                          aria-hidden
                          className="relative z-10 size-4 shrink-0"
                        />
                        {!isCompact && (
                          <span className="relative z-10 min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                        )}
                        {!isCompact && item.badge !== undefined && (
                          <span className="bg-primary text-primary-foreground relative z-10 rounded-full px-2 py-0.5 text-xs font-medium">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer: User Profile, Privacy Shield Toggle, Theme & Sign Out */}
      <div className="flex flex-col gap-4 border-t pt-5">
        <div
          className={cn(
            "flex items-center gap-3",
            isCompact && "justify-center",
          )}
        >
          <UserAvatar
            name={userName}
            src={userAvatar ?? undefined}
            className="size-11 shrink-0 rounded-[12px]"
          />
          {!isCompact && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="privacy-sensitive truncate text-sm font-medium">
                {userName}
              </p>
              <p className="text-muted-foreground privacy-sensitive truncate text-xs">
                {userSubtitle}
              </p>
            </div>
          )}
        </div>

        {!isCompact && (
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-[25px] px-1 py-1 text-sm">
            <span className="flex items-center gap-2">
              <EyeOff aria-hidden className="text-muted-foreground size-4" />
              <span>{privacyLabel}</span>
            </span>
            <Switch
              checked={privacyOn}
              onCheckedChange={togglePrivacy}
              aria-label={privacyLabel}
            />
          </label>
        )}

        {!isCompact && footerSlot}

        <div
          className={cn(
            "flex items-center gap-2",
            isCompact ? "flex-col" : "justify-between",
          )}
        >
          <ThemeToggle />
          <Button
            variant="outline"
            size={isCompact ? "icon" : "sm"}
            onClick={() => void signOut()}
            aria-label="Sign out"
            className={cn(!isCompact && "flex-1")}
          >
            <LogOut className="size-4" />
            {!isCompact && <span>Sign out</span>}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background flex min-h-dvh w-full flex-col lg:flex-row">
      {/* Mobile / Tablet Sticky Header (< lg) */}
      <header className="bg-sidebar border-sidebar-border shadow-steady-card sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[310px] overflow-y-auto p-6">
              <SheetHeader className="sr-only">
                <SheetTitle>{roleLabel} Navigation</SheetTitle>
              </SheetHeader>
              {renderNavContent(false, () => setMobileOpen(false))}
            </SheetContent>
          </Sheet>
          <BrandMark />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell userId={userId} />
        </div>
      </header>

      {/* Desktop Collapsible Sidebar (lg+) */}
      <aside
        className={cn(
          "bg-sidebar border-sidebar-border shadow-steady-card sticky top-0 hidden h-dvh shrink-0 flex-col overflow-y-auto border-r transition-[width] duration-200 lg:flex",
          collapsed ? "w-[96px] p-4" : "w-[320px] p-6",
        )}
      >
        {renderNavContent(collapsed)}
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden items-center justify-between px-6 pt-5 lg:flex">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
