import Image from "next/image";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A real route at /error.
 *
 * Middleware has always redirected here when it could not work out who the caller
 * is, but the path never existed, so the redirect landed on the 404 page instead.
 * `src/app/error.tsx` does not serve this URL: that file is Next's error boundary
 * convention and only renders when a segment throws.
 */

const REASONS: Record<string, { title: string; detail: string }> = {
  "no-role": {
    title: "Your account has no role yet",
    detail:
      "You are signed in, but the account is not registered as a student, counselor or admin. Ask the guidance office to finish setting it up.",
  },
};

const FALLBACK = {
  title: "Something went wrong",
  detail:
    "We could not verify your session. Signing in again usually fixes it.",
};

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const { title, detail } = (reason && REASONS[reason]) || FALLBACK;

  return (
    <div className="flex h-dvh flex-col items-center justify-between bg-gray-50 p-10">
      <div className="my-auto max-w-md space-y-6 text-center">
        <div className="flex items-center justify-center">
          <ShieldAlert size={80} strokeWidth={0.5} />
        </div>
        <p className="text-4xl">{title}</p>
        <p>{detail}</p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild variant="outline" size="cta">
            <Link href="/auth/login/student">Sign in again</Link>
          </Button>
          <Button asChild variant="ghost" size="cta">
            <Link href="/home">Go home</Link>
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
