import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { roles } from "@/types/main";

const TABS: { role: roles; label: string }[] = [
  { role: "student", label: "Student" },
  { role: "counselor", label: "Counselor" },
  { role: "admin", label: "Admin" },
];

export default function LoginTabs({ activeRole }: { activeRole: roles }) {
  return (
    <Tabs value={activeRole}>
      <TabsList aria-label="Log in as">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.role} value={tab.role} asChild>
            <Link href={`/auth/login/${tab.role}`}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
