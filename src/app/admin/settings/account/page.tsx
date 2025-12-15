"use client";

import AdminProfile from "./_components/profile-information";
import ChangePassword from "./_components/change-password";
import { useSearchParams } from "next/navigation";
import { CircleOff } from "lucide-react";
import { Suspense } from "react";

interface SettingSection {
  name: string;
  section: React.ReactNode;
}

const settingSectionObj: SettingSection[] = [
  {
    name: "Profile Information",
    section: <AdminProfile />,
  },
  {
    name: "Change Password",
    section: <ChangePassword />,
  }
];

export default function AccountSettingsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";

  const filteredObj = settingSectionObj.filter((section) =>
    section.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="flex-1 space-y-8">
      {filteredObj.length > 0 ? (
        filteredObj.map((section) => (
          <Suspense key={section.name} fallback={<div>Loading...</div>}>
            <div>{section.section}</div>
          </Suspense>
        ))
      ) : (
        <section className="flex items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-8">
          <CircleOff size={20} />
          <p>No results</p>
        </section>
      )}
    </main>
  );
}
