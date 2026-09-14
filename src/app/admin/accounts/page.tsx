import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import AccountsView from "./_components/accounts-view";

export const metadata: Metadata = { title: "Accounts | GCS Admin" };

export default function AccountsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Accounts"
        description="Students and counselors registered in the system."
      />
      <AccountsView />
    </div>
  );
}
