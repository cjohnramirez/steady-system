import Footer from "./_components/footer";
import NavigationBar from "./_components/navigation";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar />
      <div className="m-auto max-w-[1400px] px-15">{children}</div>
      <Footer />
    </>
  );
}
