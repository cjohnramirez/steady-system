import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/app/status-screen";
import { SignOutButton } from "./sign-out-button";

/**
 * Where the proxy and the layout guards send a session they cannot use.
 *
 * `no-role` arrives already signed out (the proxy ends the session first, which is
 * what stops this page redirecting to itself). `no-profile` is still signed in, so
 * it offers a sign-out.
 */
const REASONS: Record<
  string,
  { title: string; detail: string; signedIn: boolean }
> = {
  "no-role": {
    title: "Your account isn't set up yet",
    detail:
      "You were signed out because this account has no student, counselor or admin role. Ask the guidance office to finish setting it up.",
    signedIn: false,
  },
  unavailable: {
    title: "We couldn't check your account",
    detail:
      "Something went wrong reaching the server. Please try again in a moment.",
    signedIn: false,
  },
  "no-profile": {
    title: "We couldn't find your profile",
    detail:
      "You're signed in, but there is no profile attached to this account. Sign out and try again, or contact the guidance office.",
    signedIn: true,
  },
};

const FALLBACK = {
  title: "Something went wrong",
  detail:
    "We could not verify your session. Signing in again usually fixes it.",
  signedIn: false,
};

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const { title, detail, signedIn } = (reason && REASONS[reason]) || FALLBACK;

  return (
    <StatusScreen icon={ShieldAlert} title={title} description={detail}>
      {signedIn ? (
        <SignOutButton />
      ) : (
        <Button asChild>
          <Link href="/auth/login/student">Sign in</Link>
        </Button>
      )}
      <Button variant="outline" asChild>
        <Link href="/home">Back to home</Link>
      </Button>
    </StatusScreen>
  );
}
