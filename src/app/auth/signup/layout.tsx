import { AuthShell } from "../_components/auth-shell";

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell wide>{children}</AuthShell>;
}
