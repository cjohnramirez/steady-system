import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { roles } from "@/types/main";
import Link from "next/link";

export default function LoginTabs({ activeRole }: { activeRole: roles }) {
  return (
    <Tabs value={activeRole} defaultValue="student">
      <TabsList>
        <TabsTrigger asChild value="student">
          <Link href="/auth/login/student">Student</Link>
        </TabsTrigger>
        <TabsTrigger asChild value="admin">
          <Link href="/auth/login/admin">Admin</Link>
        </TabsTrigger>
        <TabsTrigger asChild value="counselor">
          <Link href="/auth/login/counselor">Counselor</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
