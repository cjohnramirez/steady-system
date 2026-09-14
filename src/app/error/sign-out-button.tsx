"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <Button
      loading={signingOut}
      onClick={async () => {
        setSigningOut(true);
        try {
          await createClient().auth.signOut({ scope: "local" });
          router.replace("/auth/login/student");
          router.refresh();
        } finally {
          setSigningOut(false);
        }
      }}
    >
      Sign out
    </Button>
  );
}
