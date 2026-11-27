import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import MetricSection from "../_components/metric-section";

export const metadata: Metadata = {
  title: "Caseload Analytics",
};

export default function CounselorAnalyticsPage() {
  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Caseload Analytics"
        description="Live summary of your appointment volume, pending intake requests, and completed sessions."
      />
      <MetricSection />
    </PageTransition>
  );
}
