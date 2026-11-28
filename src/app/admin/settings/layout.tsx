import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import SettingsNav from "./_components/settings-nav";

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="System Configuration & Institutional Settings"
        description="Guidance center profile, emergency responders, and RA 11036 compliance audit trail"
        actions={<SettingsNav />}
      />
      <div className="min-w-0">{children}</div>
    </PageTransition>
  );
}
