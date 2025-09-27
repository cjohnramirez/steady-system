import { STUDENTS } from "@/lib/data/students-data";
import { COUNSELORS } from "@/lib/data/counselors-data";
import { ADMINS } from "@/lib/data/admin-data";
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
