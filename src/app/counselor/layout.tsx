import NavigationBar from "@/components/navigation";
import { guardPage } from "@/lib/auth/session";

export default async function CounselorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await guardPage("counselor");

  return (
    <>
      <NavigationBar />
      <div className="m-auto max-w-[1400px] px-15">{children}</div>
    </>
  );
}
