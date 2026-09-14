import { PageHeader } from "@/components/app/page-header";
import SettingsNav from "./_components/settings-nav";

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Your account and the guidance office's public details."
      />
      <div className="grid items-start gap-8 lg:grid-cols-[14rem_1fr]">
        <SettingsNav />
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}
