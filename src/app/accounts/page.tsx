import { STUDENTS } from "@/lib/data/students";
import { COUNSELORS } from "@/lib/data/counselors";
import { ADMINS } from "@/lib/data/admin";
import AccountsClient from "./accountsClient";

export default function AccountsPage() {
  return (
    <AccountsClient
      students={STUDENTS}
      counselors={COUNSELORS}
      admins={ADMINS}
    />
  );
}
