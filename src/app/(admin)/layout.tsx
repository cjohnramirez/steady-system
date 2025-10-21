import NavigationBar from "@/components/navigation";

export default function ProtectedRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar />
      <div className="p-10">{children}</div>
    </>
  );
}
