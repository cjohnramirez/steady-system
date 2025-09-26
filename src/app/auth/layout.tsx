"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();

  return (
    <div className="p-8">
      <Tabs defaultValue="student" className="w-1/2">
        <div className="flex items-center justify-between">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <Image src="/icon.png" alt="GSU-icon" width={48} height={48} />
              <p className="text-lg">GSU</p>
            </div>
          </div>
          <TabsList>
            <TabsTrigger
              value="student"
              onClick={() => router.replace("/auth/login/student")}
            >
              Student
            </TabsTrigger>
            <TabsTrigger
              value="counselor"
              onClick={() => router.replace("/auth/login/counselor")}
            >
              Counselor
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              onClick={() => router.replace("/auth/login/admin")}
            >
              Admin
            </TabsTrigger>
          </TabsList>
        </div>
        {children}
      </Tabs>
    </div>
  );
}
