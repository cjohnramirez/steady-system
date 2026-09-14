"use client";

import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, Menu } from "lucide-react";
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
  Sheet,
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
import type { NavBar } from "@/app/home/_lib/nav-data";

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
      <div className="m-auto flex h-18 max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8">
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

        <div className="flex items-center gap-2">
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
                  <ul className="flex flex-col">
                    {navBarObj.map((item) => (
                      <li key={item.title}>
                        <a
                          href={item.link}
                          className="hover:bg-muted block rounded-md px-3 py-3"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-col gap-2">
                  {viewer ? (
                    <>
                      <Button asChild>
                        <Link href={ROLE_HOME[viewer.role]}>
                          {ROLE_CTA[viewer.role]}
                        </Link>
                      </Button>
                      <Button variant="outline" onClick={() => void signOut()}>
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild>
                        <Link href="/student/appointment">
                          Book an appointment
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={ROLE_LOGIN.student}>Log in</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
