import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { isRecoverySession } from "@/lib/auth/session";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  if (!(await isRecoverySession())) {
    return (
      <EmptyState
        icon={KeyRound}
        title="Open the link from your email"
        description="For your security, a new password can only be set from a recent reset link."
        action={
          <Button asChild>
            <Link href="/auth/forget-password">Request a reset link</Link>
          </Button>
        }
      />
    );
  }

  return <ResetPasswordForm />;
}
