import NavigationBar from "@/components/navigation";
import { ViewerProvider } from "@/components/viewer-provider";
import { getViewer } from "@/lib/auth/get-viewer";

export default async function MiscLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewer();

  return (
    <ViewerProvider viewer={viewer}>
      <NavigationBar />
      <main className="m-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-[1100px] flex-col items-center justify-center px-4 py-10 md:px-8">
        {children}
      </main>
    </ViewerProvider>
  );
}
