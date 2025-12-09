"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/hooks/auth-store";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown } from "lucide-react";
import { useConfirmStore } from "@/hooks/confirm-store";
import { createClient } from "@/utils/supabase/client";

export default function NavigationBar() {
  const { confirm, startLoading, stopLoading } = useConfirmStore();

  const router = useRouter();
  const userName = useUserStore.getState().userName;
  const userRole = useUserStore.getState().userRole;

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
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6">
      <div className="m-auto flex max-w-[1600px] items-center justify-between gap-4">
        <section
          className="flex cursor-pointer items-center gap-4"
          onClick={() => router.push("/home")}
        >
          <Image src="/icon.png" alt="logo" width={40} height={40} />
          <p>Guidance and Counselling Services</p>
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
                  <DropdownMenuItem
                    onClick={async (e) => {
                      e.preventDefault();
                      await handleChange();
                    }}
                  >
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {userRole === "admin" && (
                <Button onClick={() => router.replace("/admin/dashboard")}>
                  Go to Admin Dashboard
                </Button>
              )}
              {userRole === "student" && (
                <Button onClick={() => router.replace("/student")}>
                  Go to Profile
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
