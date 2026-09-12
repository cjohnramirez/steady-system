"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/hooks/auth-store";
import { useConfirmStore } from "@/hooks/confirm-store";
import { createClient } from "@/utils/supabase/client";

/**
 * Confirms, then ends the session.
 *
 * Each of the three navigation bars used to carry its own copy of this, and the
 * copies had drifted. All of them cleared only the name and the role from the
 * persisted store, leaving the previous user's id and mood behind for whoever
 * signed in next on the same browser. Two of them threw on failure, which reached
 * the global error boundary rather than telling the user anything useful, and two
 * called window.location.reload() instead of navigating.
 */
export function useSignOut() {
  const router = useRouter();
  const { confirm, startLoading, stopLoading } = useConfirmStore();

  return async function signOut() {
    const ok = await confirm(
      "Log out?",
      "Are you sure you want to log out? This will end your current session.",
    );

    if (!ok) return;

    startLoading();

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      stopLoading();
      toast.error("Could not sign you out. Please try again.");
      return;
    }

    useUserStore.getState().reset();
    stopLoading();

    // replace, not push, so Back does not return to a page the session no longer
    // has access to.
    router.replace("/home");
    router.refresh();
  };
}
