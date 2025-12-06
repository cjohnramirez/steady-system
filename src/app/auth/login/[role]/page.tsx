import LoginForm from "../_components/login-form";

export default async function LoginPage(props: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await props.params;

  return <LoginForm role={role as "admin" | "student" | "counselor"} />;
}
