"use client";

import { Button } from "@/components/ui/button";
import { HeartCrack, RefreshCcw } from "lucide-react";
import Image from "next/image";
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-dvh flex-col items-center justify-between bg-gray-50 p-10 font-sans">
      <div className="my-auto space-y-6 text-center">
        <div className="flex items-center justify-center">
          <HeartCrack size={80} strokeWidth={0.5} />
        </div>
        <p className="text-6xl">The site is broken</p>
        <p className="m-auto w-96">
          Whoaaaa, there seems to be some error with the site! Here is probably
          what happened
        </p>
        <div className="mt-10 flex items-center justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="text-left">
            <p className="font-medium">Something went wrong on our end</p>
            {/*
              The raw message is deliberately not shown. It can carry database
              detail, table names or a row's contents, and this page renders for
              students. The digest is what support needs to find the real error in
              the server logs.
            */}
            <p>
              {error.digest
                ? `Please quote reference ${error.digest} if you report this.`
                : "Please try again in a moment."}
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center justify-between gap-2 rounded-2xl border border-gray-200 p-2"
            onClick={() => reset()}
          >
            <RefreshCcw size={20} strokeWidth={1.5} />
            <p>Refresh</p>
          </Button>
        </div>
      </div>
      <div className="flex place-content-end items-center gap-4">
        <Image src="/icon.png" alt="logo" width={40} height={40} />
        <p>Guidance and Counseling Services</p>
      </div>
    </div>
  );
}
