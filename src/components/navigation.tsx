"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  ChevronDown,
  HandHeart,
  House,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Megaphone,
  Menu,
  Music,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandMark } from "@/components/app/brand-mark";
import { UserAvatar } from "@/components/app/user-avatar";
import { NotificationBell } from "@/components/notification-bell";
import { useViewer } from "@/components/viewer-provider";
import { useSignOut } from "@/hooks/use-sign-out";
import { ROLE_HOME, ROLE_LOGIN } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import type { NavBar, NavIcon } from "@/app/home/_lib/nav-data";

const NAV_ICONS: Record<NavIcon, LucideIcon> = {
  home: House,
  about: Info,
  services: HandHeart,
  announcements: Megaphone,
  appointment: CalendarCheck,
  articles: BookOpen,
  playlists: Music,
};

/** Full-width outline button with its icon on the left, used in the menu sheet. */
const SHEET_BUTTON = "h-11 w-full justify-start gap-3 px-4";

const ROLE_CTA = {
  admin: "Admin dashboard",
  counselor: "Counselor dashboard",
  student: "My dashboard",
} as const;

/**
 * The navigation bar for the public site, the student area and the counselor area.
 *
 * Who is signed in comes from the layout (see ViewerProvider), not from
 * localStorage, so it always matches the session cookie. Below `md` the section
 * links and account actions collapse into a sheet; the bar used to be one
 * unwrapped row that pushed the page 500px sideways on a phone.
 */
export default function NavigationBar({
  navBarObj = [],
}: {
  navBarObj?: NavBar[];
}) {
  const viewer = useViewer();
  const signOut = useSignOut();
  const fullName = viewer
    ? `${viewer.firstName} ${viewer.lastName}`.trim()
    : "";

  return (
    <nav
      aria-label="Main"
      className="bg-card/95 supports-backdrop-filter:bg-card/80 sticky top-0 z-40 border-b backdrop-blur"
    >
      {/* With section links, a 1fr/auto/1fr grid keeps them centred on the
          viewport; plain justify-between centred them between two unequal sides. */}
      <div
        className={cn(
          "m-auto flex h-18 max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8",
          navBarObj.length > 0 && "lg:grid lg:grid-cols-[1fr_auto_1fr]",
        )}
      >
        <BrandMark />

        {navBarObj.length > 0 && (
          <ul className="hidden items-center gap-8 lg:flex">
            {navBarObj.map((item) => (
              <li key={item.title}>
                <a
                  href={item.link}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2 justify-self-end">
          {viewer ? (
            <>
              <NotificationBell userId={viewer.userId} />
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden gap-2 px-2 md:flex"
                  >
                    <UserAvatar
                      name={fullName || viewer.userName}
                      src={viewer.avatar}
                      size="xs"
                    />
                    <span className="max-w-40 truncate">{viewer.userName}</span>
                    <ChevronDown aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="truncate font-medium">
                      {fullName || viewer.userName}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {viewer.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={ROLE_HOME[viewer.role]}>
                      <LayoutDashboard aria-hidden />
                      {ROLE_CTA[viewer.role]}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => void signOut()}>
                    <LogOut aria-hidden />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="outline" asChild>
                <Link href={ROLE_LOGIN.student}>Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/student/appointment">Book an appointment</Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Site sections and account actions
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-6 px-4 pb-6">
                {viewer && (
                  <div className="flex items-center gap-3 rounded-xl border p-3">
                    <UserAvatar
                      name={fullName || viewer.userName}
                      src={viewer.avatar}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {fullName || viewer.userName}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {viewer.email}
                      </p>
                    </div>
                  </div>
                )}
                {navBarObj.length > 0 && (
                  <ButtonGroup
                    orientation="vertical"
                    aria-label="On this page"
                    className="w-full"
                  >
                    {navBarObj.map((item) => {
                      const Icon = NAV_ICONS[item.icon];
                      return (
                        <SheetClose key={item.title} asChild>
                          <Button
                            variant="outline"
                            className={SHEET_BUTTON}
                            asChild
                          >
                            <a href={item.link}>
                              <Icon aria-hidden />
                              {item.title}
                            </a>
                          </Button>
                        </SheetClose>
                      );
                    })}
                  </ButtonGroup>
                )}
                <ButtonGroup
                  orientation="vertical"
                  aria-label="Account"
                  className="w-full"
                >
                  {viewer ? (
                    <>
                      <Button
                        variant="outline"
                        className={SHEET_BUTTON}
                        asChild
                      >
                        <Link href={ROLE_HOME[viewer.role]}>
                          <LayoutDashboard aria-hidden />
                          {ROLE_CTA[viewer.role]}
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className={SHEET_BUTTON}
                        onClick={() => void signOut()}
                      >
                        <LogOut aria-hidden />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className={SHEET_BUTTON}
                        asChild
                      >
                        <Link href="/student/appointment">
                          <CalendarCheck aria-hidden />
                          Book an appointment
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className={SHEET_BUTTON}
                        asChild
                      >
                        <Link href={ROLE_LOGIN.student}>
                          <LogIn aria-hidden />
                          Log in
                        </Link>
                      </Button>
                    </>
                  )}
                </ButtonGroup>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
