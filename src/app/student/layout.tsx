import { ReactNode } from "react";
import NavigationBar from "./_components/navigation";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavigationBar />
      <div className="m-auto max-w-[1600px] px-15">{children}</div>
    </>
  );
}
