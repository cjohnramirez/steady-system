// server

import LoginForm from "@/components/login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;

  return (
    <div className="mx-20">
      <div className="text-center w-full py-10">
        <p className="text-2xl font-medium">
          Hello, {role.charAt(0).toUpperCase() + role.slice(1)}
        </p>
        <p>Enter your credentials below to login to your account</p>
      </div>
      <LoginForm role={role}/>
    </div>
  );
}
