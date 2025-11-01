"use client";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const role = pathname.includes("/student")
    ? "student"
    : pathname.includes("/admin")
      ? "admin"
      : pathname.includes("/counselor")
        ? "counselor"
        : "student";

  return (
    <div className="flex h-screen p-4">
      <div className="flex w-full gap-8 rounded-4xl border p-8">
        <div className="flex w-1/2 flex-col justify-center">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image src="/icon.png" alt="logo" width={40} height={40} />
              <p>GCS</p>
            </div>
            <Tabs value={role} defaultValue="student">
              <TabsList>
                <TabsTrigger asChild value="student">
                  <Link href="/auth/login/student">Student</Link>
                </TabsTrigger>
                <TabsTrigger asChild value="admin">
                  <Link href="/auth/login/admin">Admin</Link>
                </TabsTrigger>
                <TabsTrigger asChild value="counselor">
                  <Link href="/auth/login/counselor">Counselor</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex h-full flex-col justify-center px-30">
            {children}
          </div>
        </div>
        <div className="relative w-1/2">
          <Image
            src="/auth.jpg"
            alt="Authentication image"
            fill
            priority
            className="rounded-4xl object-cover"
          />
        </div>
      </div>
    </div>
  );
}
