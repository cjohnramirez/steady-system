import LoginForm from "../_components/login-form";

export default async function LoginPage({
  params,
}: {
  params: { role: string };
}) {
  const role = params.role as "admin" | "student" | "counselor";

  return <LoginForm role={role} />;
}
