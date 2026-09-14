import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { guardPage } from "@/lib/auth/session";
import BookingForm from "./_components/booking-form";

export const metadata: Metadata = { title: "Book an appointment | GCS" };

export default async function AppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const [, { reason }] = await Promise.all([
    guardPage("student"),
    searchParams,
  ]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <PageHeader
        title="Book an appointment"
        description="Tell us what you'd like to talk about and pick a time that works for you."
      />
      <BookingForm defaultReason={reason?.slice(0, 120)} />
    </div>
  );
}
