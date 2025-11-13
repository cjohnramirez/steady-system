import { Suspense } from "react";
import SettingsSidebar from "./_components/settings-sidebar";

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen">
        <div className="flex gap-8">
          <SettingsSidebar />
          {children}
        </div>
      </div>
    </Suspense>
  );
}
