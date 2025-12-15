"use client";

import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  ArrowUpRight,
  Bell,
  BookOpenIcon,
  ChevronsUpDown,
  Home,
  Settings,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/hooks/auth-store";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirmStore } from "@/hooks/confirm-store";

type Navigation = {
  name: string;
  link: string;
};

const navigationObj: Navigation[] = [
  {
    name: "Dashboard",
    link: "/admin/dashboard",
  },
  {
    name: "Accounts",
    link: "/admin/accounts",
  },
  {
    name: "Appointments",
    link: "/admin/appointments",
  },
  {
    name: "Landing Page",
    link: "/admin/landing",
  },
  {
    name: "Settings",
    link: "/admin/settings",
  },
];

export default function NavigationBar() {
  const { confirm, startLoading, stopLoading } = useConfirmStore();
  const pathName = usePathname();
  const router = useRouter();

  const userName = useUserStore.getState().userName;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = async () => {
    const ok = await confirm(
      "Log out?",
      "Are you sure you want to log out? This will end your current session.",
    );

    if (!ok) return;

    startLoading();

    useUserStore.getState().setUserName("");
    useUserStore.getState().setUserRole("");

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) throw new Error(error.message);

    stopLoading();
    window.location.reload();
  };

  return (
    <div className="sticky top-0 z-2 flex w-full flex-col gap-5 border-b bg-white p-6 pb-0">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-10">
          <div
            className="flex cursor-pointer items-center gap-4"
            onClick={() => router.replace("/home")}
          >
            <Image src="/icon.png" alt="GCS Icon" width={40} height={40} />
            <p>Guidance and Counseling Services</p>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center gap-4">
              {isClient ? (
                <>
                  <div className="from-brand-light to-brand-normal h-6 w-6 rounded-full bg-linear-to-t" />
                  <p>{userName}</p>
                  <Badge variant="secondary">User Role</Badge>
                  <ChevronsUpDown size={20} />
                </>
              ) : (
                <>
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-5 w-5" />
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-6 p-6">
              <div className="flex flex-col items-start">
                <p className="font-medium">{userName}</p>
                <p>Admin account</p>
              </div>
              <div className="space-y-4">
                <Link
                  href="/admin/settings"
                  className="flex items-center justify-between gap-20"
                >
                  <p>Account Settings</p>
                  <Settings strokeWidth={1.25} />
                </Link>
                <Link
                  href="/home"
                  className="flex items-center justify-between gap-20"
                >
                  <p>Home Page</p>
                  <Home strokeWidth={1.25} />
                </Link>
              </div>
              <Button
                onClick={async () => {
                  await handleChange();
                }}
                className="w-full"
              >
                Log Out
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center gap-4" asChild>
              <Button variant="outline" className="w-9">
                <BookOpenIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-3 mr-6">
              <DropdownMenuItem>
                <Link href="/misc/meet-the-developers">
                  Meet the Developers
                </Link>{" "}
                <ArrowUpRight />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/">User Documentation</Link> <ArrowUpRight />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/misc/privacy-policy">Privacy Policy</Link>{" "}
                <ArrowUpRight />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex gap-8 pl-5">
        {navigationObj.map((nav) => {
          const isActive =
            (pathName === "/admin" && nav.name === "Dashboard") ||
            pathName === nav.link ||
            pathName.startsWith(`${nav.link}`);

          const activeStatus = clsx("border-b-2 pb-2", {
            "border-gray-700": isActive,
            "border-none": !isActive,
          });

          return (
            <Link href={nav.link} key={nav.name} className={activeStatus}>
              {nav.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
