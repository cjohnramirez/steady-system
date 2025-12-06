import NavigationBar from "@/components/navigation";

export default function CounselorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar navBarObj={[]} />
      <div className="m-auto max-w-[1400px] px-15">{children}</div>
    </>
  );
}
