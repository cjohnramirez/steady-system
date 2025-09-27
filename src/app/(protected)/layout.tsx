import NavigationBar from "@/components/navigation";

export default function ProtectedRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <NavigationBar />
      {children}
    </div>
  );
}
