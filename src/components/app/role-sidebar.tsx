"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import * as m from "motion/react-m";
import {
  ChevronRight,
  ChevronsUpDown,
  EyeOff,
  LogOut,
  Menu,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Siren,
  SlidersHorizontal,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { AccountSettingsDialog } from "@/components/app/account-settings-dialog";
import { BrandMark } from "@/components/app/brand-mark";
import { CrisisSupportDialog } from "@/components/app/crisis-dialog";
import { SteadyMark } from "@/components/app/steady-mark";
import { UserAvatar } from "@/components/app/user-avatar";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePrivacyShield } from "@/components/app/privacy-shield";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  settingsHref?: string;
  children: ReactNode;
}

function resolveCrisisRole(
  roleLabel: string,
): "student" | "counselor" | "admin" {
  const lower = roleLabel.toLowerCase();
  if (lower.includes("admin")) return "admin";
  if (lower.includes("counselor")) return "counselor";
  return "student";
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
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { enabled: privacyOn, toggle: togglePrivacy } = usePrivacyShield();
  const signOut = useSignOut();

  const crisisRole = resolveCrisisRole(roleLabel);

  const isActive = (item: SidebarNavItemDef) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const activeNavItem = groups
    .flatMap((g) => g.items)
    .find((item) => isActive(item));
  const breadcrumbPage = activeNavItem?.label ?? "Dashboard";

  const renderNavContent = (isCompact: boolean, closeMobile?: () => void) => (
    <div className="flex h-full flex-col justify-between gap-6">
      <div className="flex flex-col gap-7">
        {/* Brand header — left aligned with nav labels, bell flush with active item right edge */}
        <div
          className={cn(
            "flex items-center justify-between gap-3",
            !isCompact && "pl-3",
            isCompact && "justify-center",
          )}
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <SteadyMark className="size-11 shrink-0" />
            {!isCompact && (
              <div className="min-w-0 leading-snug">
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
          className={cn("flex flex-col", isCompact ? "gap-2" : "gap-6")}
        >
          {groups.map((group) => (
            <div
              key={group.title}
              className={cn("flex flex-col", isCompact ? "gap-0" : "gap-2.5")}
            >
              {!isCompact && (
                <p className="text-muted-foreground px-3 text-[15px] font-normal">
                  {group.title}
                </p>
              )}
              <ul
                className={cn("flex flex-col", isCompact ? "gap-2" : "gap-1")}
              >
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
                          strokeWidth={1.5}
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

      {/* Footer: Optional role footerSlot & Profile Dropdown */}
      <div className="flex flex-col gap-3 pt-2">
        {!isCompact && footerSlot}

        {/* Sidebar Profile Dropdown (styled identically to other Steady dropdowns) */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open account menu"
              className={cn(
                "hover:bg-muted/70 focus-visible:ring-ring/50 flex w-full cursor-pointer items-center gap-4 rounded-[14px] p-1.5 text-left transition-colors outline-none focus-visible:ring-[3px]",
                isCompact && "justify-center p-1",
              )}
            >
              <UserAvatar
                name={userName}
                src={userAvatar ?? undefined}
                className="size-11 shrink-0 rounded-[10px]"
              />
              {!isCompact && (
                <>
                  <div className="min-w-0 flex-1 leading-snug">
                    <p className="privacy-sensitive text-foreground truncate text-[15px] font-medium">
                      {userName}
                    </p>
                    <p className="text-muted-foreground privacy-sensitive truncate text-[15px] font-normal">
                      {userSubtitle}
                    </p>
                  </div>
                  <ChevronsUpDown
                    aria-hidden
                    strokeWidth={1.5}
                    className="text-foreground/70 size-4 shrink-0"
                  />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={10}
            className="w-[290px]"
          >
            {/* Profile Header Band — ONLY divider in the dropdown */}
            <div className="border-border mb-1.5 flex items-center gap-3.5 border-b px-2.5 pt-1.5 pb-3">
              <UserAvatar
                name={userName}
                src={userAvatar ?? undefined}
                className="size-11 shrink-0 rounded-[10px]"
              />
              <div className="min-w-0 flex-1 leading-snug">
                <p className="privacy-sensitive text-foreground truncate text-[15px] font-medium">
                  {userName}
                </p>
                <p className="text-muted-foreground privacy-sensitive truncate text-[14px] font-normal">
                  {userSubtitle}
                </p>
              </div>
            </div>

            {/* Account Settings Modal */}
            <DropdownMenuItem
              onSelect={() => {
                closeMobile?.();
                setAccountOpen(true);
              }}
            >
              <SlidersHorizontal
                aria-hidden
                strokeWidth={1.5}
                className="size-4 shrink-0"
              />
              <span>Account Settings</span>
            </DropdownMenuItem>

            {/* Campus / Desk Privacy Switch */}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                togglePrivacy();
              }}
              className="justify-between"
            >
              <span className="flex items-center gap-2.5">
                <EyeOff
                  aria-hidden
                  strokeWidth={1.5}
                  className="text-muted-foreground size-4 shrink-0"
                />
                <span>{privacyLabel}</span>
              </span>
              <Switch
                checked={privacyOn}
                onCheckedChange={togglePrivacy}
                onClick={(e) => e.stopPropagation()}
                aria-label={privacyLabel}
              />
            </DropdownMenuItem>

            {/* Appearance Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
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
                <span>Appearance</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="min-w-44">
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light">
                    <Sun aria-hidden strokeWidth={1.5} className="size-4" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon aria-hidden strokeWidth={1.5} className="size-4" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Monitor aria-hidden strokeWidth={1.5} className="size-4" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Crisis Protocol */}
            <DropdownMenuItem
              onSelect={() => {
                closeMobile?.();
                setCrisisOpen(true);
              }}
            >
              <Siren
                aria-hidden
                strokeWidth={1.5}
                className="size-4 shrink-0"
              />
              <span>Crisis Protocol</span>
            </DropdownMenuItem>

            {/* Logout */}
            <DropdownMenuItem
              onSelect={() => {
                closeMobile?.();
                void signOut();
              }}
            >
              <LogOut
                aria-hidden
                strokeWidth={1.5}
                className="size-4 shrink-0"
              />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                <Menu strokeWidth={1.5} className="size-5" />
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
        <div className="hidden items-center gap-4 px-8 pt-6 lg:flex">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-foreground hover:bg-muted focus-visible:ring-ring/50 -m-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-[3px]"
          >
            {collapsed ? (
              <PanelLeftOpen strokeWidth={1.5} className="size-4" />
            ) : (
              <PanelLeftClose strokeWidth={1.5} className="size-4" />
            )}
          </button>
          <span aria-hidden className="bg-border h-5 w-px" />
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2.5 text-[15px] font-normal"
          >
            <span className="text-foreground">{roleLabel}</span>
            <ChevronRight
              aria-hidden
              strokeWidth={1.5}
              className="text-muted-foreground size-4"
            />
            <span className="text-foreground/85">{breadcrumbPage}</span>
          </nav>
        </div>
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>

      <CrisisSupportDialog
        open={crisisOpen}
        onOpenChange={setCrisisOpen}
        role={crisisRole}
      />

      <AccountSettingsDialog
        open={accountOpen}
        onOpenChange={setAccountOpen}
        role={crisisRole}
      />
    </div>
  );
}
