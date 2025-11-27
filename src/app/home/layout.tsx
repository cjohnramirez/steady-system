import NavigationBar from "@/components/navigation";
import { homeNavBarObj } from "./_lib/nav-data";
import Footer from "@/components/footer";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar navBarObj={homeNavBarObj} />
      <div className="m-auto max-w-[1400px] px-15">{children}</div>
      <Footer navBarObj={homeNavBarObj} />
    </>
  );
}
