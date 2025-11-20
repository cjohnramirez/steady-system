import NavigationBar from "../../home/_components/navigation";

export default function AppointmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar />
      <div className="m-auto max-w-[1400px] px-15">{children}</div>
    </>
  );
}
