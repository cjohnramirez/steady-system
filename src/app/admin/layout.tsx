import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MonitorSmartphone } from "lucide-react";
import NavigationBar from "./_components/navigation";
import { LiveUpdates } from "@/components/live-updates";
import { ViewerProvider } from "@/components/viewer-provider";
import { guardPage } from "@/lib/auth/session";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} Admin`,
    template: `%s | ${BRAND.name} Admin`,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Defence in depth. The proxy already gates /admin; this makes sure a matcher
  // change or a proxy failure cannot quietly open the whole area.
  const viewer = await guardPage("admin");

  return (
    <ViewerProvider viewer={viewer}>
      <NavigationBar />
      <LiveUpdates />
      {/* The admin console is built for desktop. Below lg it says so instead of
          rendering tables and charts that cannot fit. */}
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 py-16 text-center lg:hidden">
        <MonitorSmartphone aria-hidden strokeWidth={1} className="size-14" />
        <h1 className="text-2xl tracking-tight">Use a larger screen</h1>
        <p className="text-muted-foreground max-w-sm">
          The admin console needs at least a tablet in landscape or a laptop.
          Please switch devices or widen this window.
        </p>
      </div>
      <main className="m-auto hidden max-w-[1600px] px-8 py-10 lg:block">
        {children}
      </main>
    </ViewerProvider>
  );
}
