"use client";

import Image from "next/image";
import LoginTabs from "./_components/login-tabs";
import { roles } from "@/types/main";
import { useParams } from "next/navigation";

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { role }: { role: roles } = useParams();

  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center overflow-y-auto p-4">
      <div className="flex w-full max-w-6xl flex-col gap-8 rounded-4xl border p-8 md:flex-row">
        <div className="flex flex-col justify-center md:w-1/2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image src="/icon.png" alt="logo" width={40} height={40} />
              <p>GCS</p>
            </div>
            <LoginTabs activeRole={role as roles} />
          </div>
          <div className="flex flex-col justify-center gap-4 py-15">
            {children}
          </div>
        </div>
        <div className="relative h-[400px] md:h-auto md:w-1/2">
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
