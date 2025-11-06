import NavigationBar from "./_components/navigation";

export default function ProtectedRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar />
      <div className="p-10 max-w-[1600px] m-auto">{children}</div>
    </>
  );
}
