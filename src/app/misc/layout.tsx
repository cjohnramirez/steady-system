import NavigationBar from "@/components/navigation";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar navBarObj={[]} />
      <div className="m-auto flex min-h-[calc(100dvh-90px)] w-full max-w-[1100px] flex-col items-center justify-center">
        {children}
      </div>
    </>
  );
}
