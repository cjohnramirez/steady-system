"use client";

import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { Bell, BookOpenIcon, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

type Navigation = {
  name: string;
  link: string;
};

const navigationObj: Navigation[] = [
  {
    name: "Dashboard",
    link: "/dashboard",
  },
  {
    name: "Accounts",
    link: "/accounts",
  },
  {
    name: "Appointments",
    link: "/appointments",
  },
];

export default function NavigationBar() {
  const pathName = usePathname();

  return (
    <div className="flex flex-col w-full border-b-1 p-5 pb-0 gap-5">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Image src="/icon.png" alt="GCS Icon" width={48} height={48} />
          <p>Guidance and Counseling Services</p>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line
              x1="7"
              y1="20"
              x2="17"
              y2="4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center gap-4">
              <div className="h-6 w-6 bg-linear-to-t rounded-full from-amber-300 to-amber-600" />
              <p>Username</p>
              <Badge variant="secondary">User Role</Badge>
              <ChevronsUpDown size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Account Options</DropdownMenuLabel>
              <DropdownMenuItem>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-4">
          <Input placeholder="Filter name..." />
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
          const isActive = pathName === nav.link || pathName.startsWith(`${nav.link}`);

          const activeStatus = clsx(
            "border-b-2 pb-2",
            {
              "border-gray-700": isActive,
              "border-none": !isActive
            }
          );

          return (
            <Link
              href={nav.link}
              key={nav.name}
              className={activeStatus}
            >
              {nav.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
