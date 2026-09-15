"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { createClient } from "@/utils/supabase/client";

/**
 * Confirms, then ends the session. The confirm dialog stays open with a spinner
 * while signing out.
 *
 * Two things an earlier version missed. The React Query cache survived sign-out,
 * and because most keys did not include a user id, the next person to sign in on
 * the same browser saw the previous user's profile and appointments until each
 * query went stale. And the default global scope signed the user out on every
 * device, not just this one.
 */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  return async function signOut() {
    await confirm({
      title: "Log out?",
      description: "You will need to sign in again to see your dashboard.",
      confirmLabel: "Log out",
      action: async () => {
        const { error } = await createClient().auth.signOut({
          scope: "local",
        });
        if (error) {
          toast.error("Could not sign you out. Please try again.");
          return;
        }

        queryClient.clear();
        // replace, not push, so Back does not return to a page the session no
        // longer has access to. refresh re-runs the layouts, which re-read the viewer.
        router.replace("/home");
        router.refresh();
      },
    });
  };
}
