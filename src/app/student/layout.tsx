import { ReactNode } from "react";
import NavigationBar from "./_components/navigation";
import { guardPage } from "@/lib/auth/session";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  await guardPage("student");

  return (
    <>
      <NavigationBar />
      <div className="m-auto max-w-[1600px] px-15">{children}</div>
    </>
  );
}
