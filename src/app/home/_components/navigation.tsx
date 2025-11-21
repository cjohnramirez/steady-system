"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { navBarObj } from "../_lib/nav-data";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/auth-store";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown } from "lucide-react";
import { handleChange } from "@/app/admin/_components/navigation";

export default function NavigationBar() {
  const router = useRouter();
  const userName = useUserStore.getState().userName;
  const userRole = useUserStore.getState().userRole;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="border-b-1 border-gray-200 bg-white p-6">
      <div className="m-auto flex max-w-[1600px] items-center justify-between gap-4">
        <section
          className="flex cursor-pointer items-center gap-4"
          onClick={() => router.push("/home")}
        >
          <Image src="/icon.png" alt="logo" width={40} height={40} />
          <p>Guidance and Counselling Services</p>
        </section>
        <section className="flex items-center gap-10">
          {navBarObj.map((navBar) => (
            <a href={navBar.link} key={navBar.title}>
              {navBar.title}
            </a>
          ))}
        </section>
        <section className="flex space-x-4">
          {isClient && userName != "" ? (
            <>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="flex items-center gap-4">
                  <div className="from-brand-light to-brand-normal h-6 w-6 rounded-full bg-linear-to-t" />
                  <p>{userName}</p>
                  <Badge variant="secondary">{userRole}</Badge>
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
              {userRole === "admin" && (
                <Button
                  onClick={() => router.replace("/admin/dashboard")}
                >
                  Go to Admin Dashboard
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => router.replace("/auth/login/student")}
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
