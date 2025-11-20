"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import img from "../../../assets/hero.jpg";
import { useRouter } from "next/navigation";

export default function HomeSection() {
  const router = useRouter();

  return (
    <section className="h-[calc(100dvh_-_150px)] max-h-[800px]" id="home">
      <div className="flex h-3/5 items-center justify-between">
        <div className="w-2/3 max-w-[700px] space-y-4">
          <p className="text-6xl">Nurturing Student Growth and Well-being</p>
          <p className="w-2/3">
            The Guidance and Counseling Services (GCS) of USTP-CDO is dedicated
            to the holistic development of every student — fostering emotional,
            psychological, and academic balance through support, counseling, and
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
            <Button variant="outline" size="cta">
              See Events, Articles, and More
            </Button>
          </div>
        </div>
        <div className="w-1/4 rounded-xl border-1 border-gray-200 bg-white">
          <div className="flex items-center gap-4 border-b-1 px-6 py-4">
            <MapPin
              className="rounded-full border-1 border-gray-200 p-2"
              size={40}
              strokeWidth={1.25}
            />
            <p className="font-medium">Location</p>
          </div>
          <div className="space-y-2 p-6">
            <p className="font-medium">
              Claro M. Recto Avenue, Lapasan 9000 Cagayan de Oro City,
              Philippines
            </p>
            <p>Room 1, Bldg 02, Science Complex</p>
            <Button className="mt-2">See Location in Maps</Button>
          </div>
        </div>
      </div>
      <div className="from-brand-light to-brand-normal relative h-2/5 rounded-4xl bg-linear-to-br">
        <Image
          src={img}
          alt="Authentication image"
          fill
          priority
          className="rounded-4xl object-cover p-3"
        />
      </div>
    </section>
  );
}
