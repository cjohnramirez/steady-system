import type { ReactNode } from "react";
import NavigationBar from "@/components/navigation";
import Footer from "@/components/footer";
import { ViewerProvider } from "@/components/viewer-provider";
import { getViewer } from "@/lib/auth/get-viewer";
import { portalNavBarObj } from "../home/_lib/nav-data";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await getViewer();

  return (
    <ViewerProvider viewer={viewer}>
      <NavigationBar navBarObj={portalNavBarObj} />
      <main className="m-auto flex max-w-[1600px] flex-col gap-12 px-4 py-8 md:gap-16 md:px-8 md:py-12">
        {children}
      </main>
      <Footer navBarObj={portalNavBarObj} />
    </ViewerProvider>
  );
}
