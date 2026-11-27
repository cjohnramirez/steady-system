import type { Metadata } from "next";
import { ComponentShowcase } from "./_components/component-showcase";

export const metadata: Metadata = {
  title: "Component Showcase",
  robots: { index: false, follow: false },
};

export default function DevComponentsPage() {
  return <ComponentShowcase />;
}
