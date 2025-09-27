"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();

  return (
    <div className="flex w-full h-screen p-8 gap-8"> {/* full screen height */}
      <div className="w-1/2 flex flex-col">
        <Tabs defaultValue="student" className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3 items-center">
              <Image src="/icon.png" alt="GSU-icon" width={48} height={48} />
              <p className="text-lg font-semibold">GSU</p>
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
      <div className="relative w-1/2 h-full rounded-2xl overflow-hidden">
        <Image
          src="/auth-img.jpg"
          alt="USTP Image"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
