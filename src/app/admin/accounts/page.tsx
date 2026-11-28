import type { Metadata } from "next";
import { guardPage } from "@/lib/auth/session";
import { PageTransition } from "@/components/motion/primitives";
import AccountsView from "./_components/accounts-view";

export const metadata: Metadata = { title: "Accounts & Directory Management" };

export default async function AccountsPage() {
  await guardPage("admin");
  return (
    <PageTransition className="flex flex-col gap-6">
      <AccountsView />
    </PageTransition>
  );
}
