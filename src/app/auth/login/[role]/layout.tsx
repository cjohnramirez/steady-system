import { notFound } from "next/navigation";
import { isRole } from "@/lib/auth/roles";
import { AuthShell } from "../../_components/auth-shell";
import LoginTabs from "./login-tabs";

export default async function LoginLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  if (!isRole(role)) notFound();

  return (
    <AuthShell headerAction={<LoginTabs activeRole={role} />}>
      {children}
    </AuthShell>
  );
}
