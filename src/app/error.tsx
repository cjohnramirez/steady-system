"use client";

import Link from "next/link";
import { HeartCrack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/app/status-screen";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusScreen
      icon={HeartCrack}
      title="Something went wrong"
      description={
        // The raw message is deliberately not shown. It can carry database detail,
        // and this page renders for students. The digest is what finds the real
        // error in the server logs.
        error.digest
          ? `Please try again. If it keeps happening, quote reference ${error.digest}.`
          : "Please try again in a moment."
      }
    >
      <Button onClick={() => reset()}>Try again</Button>
      <Button variant="outline" asChild>
        <Link href="/home">Back to home</Link>
      </Button>
    </StatusScreen>
  );
}
