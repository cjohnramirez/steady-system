import { notFound } from "next/navigation";
import { isRole } from "@/lib/auth/roles";
import LoginForm from "../_components/login-form";

const GREETING = {
  student: "Welcome back",
  counselor: "Counselor log in",
  admin: "Admin log in",
} as const;

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ role }, { error }] = await Promise.all([params, searchParams]);
  // An unknown role used to render a form that failed validation on a hidden field
  // and silently did nothing.
  if (!isRole(role)) notFound();

  return <LoginForm role={role} title={GREETING[role]} initialError={error} />;
}
