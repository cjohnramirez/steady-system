"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import img from "../../../assets/hero.jpg";
import { useRouter } from "next/navigation";

export default function HomeSection() {
  const router = useRouter();

  return (
    <section className="h-[calc(100dvh-150px)] max-h-[800px]" id="home">
      <div className="flex h-3/5 items-center justify-between">
        <div className="w-2/3 max-w-[700px] space-y-4">
          <p className="text-6xl">Nurturing Student Growth and Well-being</p>
          <p className="w-2/3">
            The Guidance and Counseling Services (GCS) of USTP-CDO is dedicated
            to the holistic development of every student — fostering emotional,
            psychological, and academic balance through support, Counseling, and
            care.
          </p>
          <div className="flex items-center gap-4">
            <Button
              size="cta"
              onClick={() => router.replace("/student/appointment")}
            >
              Book an Appointment
              <ArrowRight />
            </Button>
            <Button
              variant="outline"
              size="cta"
              onClick={() => router.push("/portal")}
            >
              Go to GCS Portal
            </Button>
          </div>
        </div>
        <div className="w-1/4 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-4 border-b px-6 py-4">
            <MapPin
              className="rounded-full border border-gray-200 p-2"
              size={40}
              strokeWidth={1.25}
            />
            <p className="font-medium">Location</p>
          </div>
          <div className="space-y-2 p-6 flex flex-col">
            <p className="font-medium">
              Claro M. Recto Avenue, Lapasan 9000 Cagayan de Oro City,
              Philippines
            </p>
            <p>Room 1, Bldg 02, Science Complex</p>
            <a className="mt-2 bg-brand-normal text-white p-3 w-fit rounded-md font-medium" href="https://www.google.com/maps/place/University+of+Science+and+Technology+of+Southern+Philippines+-+CDO+Campus/@8.4852052,124.6563621,18z/data=!4m6!3m5!1s0x32fff2c3ca5ae8c7:0x880805868ab84491!8m2!3d8.4847692!4d124.6567168!16s%2Fg%2F11cs6lpz3h?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D" target="_blank">See Location in Maps</a>
          </div>
        </div>
      </div>
      <div className="relative h-2/5 rounded-4xl">
        <Image
          src={img}
          alt="Authentication image"
          fill
          priority
          className="rounded-4xl object-cover"
        />
      </div>
    </section>
  );
}
