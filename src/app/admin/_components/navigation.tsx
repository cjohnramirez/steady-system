"use client";

import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { Bell, BookOpenIcon, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/hooks/auth-store";

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

export async function handleChange() {
  useUserStore.getState().setUserName("");
  useUserStore.getState().setUserRole("");

  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);

  window.location.reload();
}

export default function NavigationBar() {
  const pathName = usePathname();
  const router = useRouter();

  return (
    <div className="sticky top-0 z-2 flex w-full flex-col gap-5 border-b-1 bg-white p-5 pb-0">
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
              <div className="from-brand-light to-brand-normal h-6 w-6 rounded-full bg-linear-to-t" />
              <p>Username</p>
              <Badge variant="secondary">User Role</Badge>
              <ChevronsUpDown size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Account Options</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={async () => {
                  await handleChange();
                }}
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="w-9">
            <Bell />
          </Button>
          <Button variant="outline" className="w-9">
            <BookOpenIcon />
          </Button>
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
