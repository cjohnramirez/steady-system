"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/hooks/auth-store";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronsUpDown } from "lucide-react";
import { NavBar } from "@/app/home/_lib/nav-data";
import { useSignOut } from "@/hooks/use-sign-out";
import { ROLE_HOME, ROLE_LOGIN } from "@/lib/auth/roles";

const ROLE_CTA: Record<string, string> = {
  admin: "Go to Admin Dashboard",
  counselor: "Go to Counselor Dashboard",
  student: "Go to Profile",
};

/**
 * The navigation bar for the public site, the student area and the counselor area.
 *
 * The student area used to ship a near-identical copy of this file. The only real
 * difference was how it decided whether someone was signed in, and the two
 * disagreed: this one watched Supabase auth state while the student copy checked
 * whether a name happened to be in localStorage. The admin area keeps its own bar
 * because it carries a second row of section tabs.
 */
export default function NavigationBar({
  navBarObj = [],
}: {
  navBarObj?: NavBar[];
}) {
  const router = useRouter();
  const signOut = useSignOut();

  const userName = useUserStore((state) => state.userName);
  const userRole = useUserStore((state) => state.userRole);

  // The store is restored from localStorage, so the first client render has to
  // match the server's empty one or React reports a hydration mismatch.
  const hydrated = useHydrated();

  const signedIn = hydrated && userRole !== "";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white p-6">
      <div className="m-auto flex max-w-[1600px] items-center justify-between gap-4">
        <section
          className="flex cursor-pointer items-center gap-4"
          onClick={() => router.push("/home")}
        >
          <Image src="/icon.png" alt="logo" width={40} height={40} />
          <p>Guidance and Counseling Services</p>
        </section>

        {navBarObj.length > 0 && (
          <section className="flex items-center gap-10">
            {navBarObj.map((navBar) => (
              <a href={navBar.link} key={navBar.title}>
                {navBar.title}
              </a>
            ))}
          </section>
        )}

        <section className="flex space-x-4">
          {!hydrated ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : signedIn ? (
            <>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="flex items-center gap-4">
                  <div className="from-brand-light to-brand-normal h-6 w-6 rounded-full bg-linear-to-t" />
                  <p>{userName || "User"}</p>
                  <Badge variant="secondary">{userRole}</Badge>
                  <ChevronsUpDown size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={async (e) => {
                      e.preventDefault();
                      await signOut();
                    }}
                  >
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => router.replace(ROLE_HOME[userRole])}>
                {ROLE_CTA[userRole]}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => router.replace(ROLE_LOGIN.student)}
              >
                Login
              </Button>
              <Button onClick={() => router.replace("/student/appointment")}>
                Book an Appointment
              </Button>
            </>
          )}
        </section>
      </div>
    </nav>
  );
}
