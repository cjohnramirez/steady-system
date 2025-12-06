import { ReactNode } from "react";
import NavigationBar from "@/components/navigation";
import { portalNavBarObj } from "../home/_lib/nav-data";
import Footer from "@/components/footer";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavigationBar navBarObj={portalNavBarObj}/>
      <div className="m-auto max-w-[1600px] p-15 flex flex-col gap-15">{children}</div>
      <Footer navBarObj={portalNavBarObj}/>
    </>
  );
}
