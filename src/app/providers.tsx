"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationListener } from "@/hooks/notification-store";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {userId && <NotificationListener userId={userId} />}
      {children}
    </QueryClientProvider>
  );
}
