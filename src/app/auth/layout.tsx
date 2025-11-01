import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1400px] h-screen">{children}</div>;
}
