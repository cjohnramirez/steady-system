import NavigationBar from "@/components/navigation";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar navBarObj={[]} />
      <div className="flex flex-col items-center justify-center m-auto max-w-[1100px] w-full min-h-[calc(100dvh-90px)]">{children}</div>
    </>
  );
}
