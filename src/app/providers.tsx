"use client";

import { useState } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { LazyMotion, MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrivacyShieldProvider } from "@/components/app/privacy-shield";
import { toErrorMessage } from "@/lib/result";

const loadMotionFeatures = () =>
  import("motion/react").then((mod) => mod.domAnimation);

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.state.data !== undefined) return;
            toast.error(
              toErrorMessage(error, "Something could not be loaded."),
            );
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _vars, _ctx, mutation) => {
            if (mutation.options.onError) return;
            toast.error(toErrorMessage(error));
          },
        }),
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <LazyMotion features={loadMotionFeatures} strict>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={300}>
              <PrivacyShieldProvider>{children}</PrivacyShieldProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </LazyMotion>
      </MotionConfig>
    </ThemeProvider>
  );
}
