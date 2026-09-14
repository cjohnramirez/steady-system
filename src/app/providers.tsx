"use client";

import { useState } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toErrorMessage } from "@/lib/result";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
        // One place that tells the user a load failed, so a list that could not load
        // is not mistaken for an empty one. Background refetch failures stay quiet
        // when there is already data on screen.
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.state.data !== undefined) return;
            toast.error(
              toErrorMessage(error, "Something could not be loaded."),
            );
          },
        }),
        // Mutations with their own onError handle their own messages.
        mutationCache: new MutationCache({
          onError: (error, _vars, _ctx, mutation) => {
            if (mutation.options.onError) return;
            toast.error(toErrorMessage(error));
          },
        }),
      }),
  );

  return (
    // The theme is a class on <html> ("light", "dark"), defaulting to the device
    // setting. next-themes sets it before paint, so there is no flash.
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
