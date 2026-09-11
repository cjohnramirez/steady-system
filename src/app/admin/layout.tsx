import NavigationBar from "./_components/navigation";
import { guardPage } from "@/lib/auth/session";

export default async function ProtectedRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Defence in depth. Middleware already gates /admin; this makes sure a matcher
  // change or a middleware failure cannot quietly open the whole area.
  await guardPage("admin");

  return (
    <>
      <NavigationBar />
      <div className="p-10 max-w-[1600px] m-auto bg-gray-50">{children}</div>
    </>
  );
}
