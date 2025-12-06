"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AppointmentSection() {
  const router = useRouter();

  return (
    <section id="appointment">
      <div className="m-auto flex h-1/2 max-w-[600px] flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="rounded-xl border border-gray-200 bg-white px-10 py-2">
          Appointment
        </div>
        <p className="mt-5 text-4xl">Book an Appointment</p>
        <p>
          Schedule your appointment easily online — no more waiting lines or
          paperwork.
        </p>
        <div className="flex items-center gap-4 pt-5">
          <Button
            size="cta"
            onClick={() => router.replace("/student/appointment")}
          >
            Book an Appointment
            <ArrowRight />
          </Button>
          <Button variant="outline" size="cta">
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
}
