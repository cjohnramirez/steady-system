"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center overflow-y-auto p-4">
      <div className="flex w-full max-w-6xl flex-col gap-8 rounded-4xl border bg-white p-8 md:flex-row">
        <div className="flex flex-col justify-center md:w-1/2">
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex cursor-pointer items-center gap-3"
              onClick={() => router.push("/home")}
            >
              <Image src="/icon.png" alt="logo" width={40} height={40} />
              <p>GCS</p>
            </div>
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
