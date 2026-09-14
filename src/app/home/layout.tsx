import NavigationBar from "@/components/navigation";
import Footer from "@/components/footer";
import { ViewerProvider } from "@/components/viewer-provider";
import { getViewer } from "@/lib/auth/get-viewer";
import { homeNavBarObj } from "./_lib/nav-data";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewer();

  return (
    <ViewerProvider viewer={viewer}>
      <NavigationBar navBarObj={homeNavBarObj} />
      <main className="m-auto max-w-[1400px] px-4 md:px-8">{children}</main>
      <Footer navBarObj={homeNavBarObj} />
    </ViewerProvider>
  );
}
