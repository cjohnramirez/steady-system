"use client";

import { Button } from "@/components/ui/button";
import { TrafficCone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-dvh flex-col items-center justify-between p-10 bg-gray-50">
      <div className="my-auto space-y-6 text-center">
        <div className="relative ml-15 flex items-center justify-center">
          <TrafficCone size={80} strokeWidth={0.5} />
          <TrafficCone
            size={80}
            strokeWidth={0.5}
            className="absolute -top-5 left-10 ml-5"
          />
        </div>
        <p className="text-6xl">404 Not Found</p>
        <p className="w-96">
          Oops, we can&apos;t seem to find this page. You are either does not have
          the access or you are just out of luck. Try going back home instead!
        </p>
        <Button
          variant="outline"
          size="cta"
          onClick={() => router.replace("/home")}
        >
          Come back home, baby!
        </Button>
      </div>
      <div className="flex place-content-end items-center gap-4">
        <Image src="/icon.png" alt="logo" width={40} height={40} />
        <p>Guidance and Counseling Services</p>
      </div>
    </div>
  );
}
