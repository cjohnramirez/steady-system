"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      onClick={async () => {
        await createClient().auth.signOut({ scope: "local" });
        router.replace("/auth/login/student");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
