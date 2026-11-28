import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { guardPage } from "@/lib/auth/session";
import BookingForm from "./_components/booking-form";

export const metadata: Metadata = { title: "Book a Consultation Session" };

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
    <div className="flex flex-col gap-6 md:gap-7">
      <PageHeader
        title="Book a Consultation Session"
        description="Confidential one-on-one time with your assigned college guidance counselor"
      />
      <BookingForm defaultReason={reason?.slice(0, 120)} />
    </div>
  );
}
