"use client";

import Image from "next/image";
import { ArrowUpRight, CalendarCheck2, Home, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchOrganization } from "@/app/home/actions";
import { NavBar } from "@/app/home/_lib/nav-data";

export default function Footer({ navBarObj }: { navBarObj?: NavBar[] }) {
  const { data: organization } = useQuery({
    queryKey: ["organization"],
    queryFn: fetchOrganization,
  });

  const parseTime = (timeString: string): string => {
    if (!timeString) return "";
    // Extract HH:MM from format like "08:00:00+08"
    const timePart = timeString.split("+")[0] || timeString.split("-")[0];
    const [hours, minutes] = timePart.split(":").slice(0, 2);
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <section className="border-t border-gray-200 bg-white p-15">
      <div className="m-auto flex max-w-[1600px] justify-between gap-4">
        <div className="w-1/3 space-y-10">
          <section className="flex items-center gap-4">
            <Image src="/icon.png" alt="logo" width={40} height={40} />
            <p className="font-medium">{organization?.name || "Guidance and Counseling Services"}</p>
          </section>
          <p>
            We are dedicated to the holistic development of every student
            fostering emotional, psychological, and academic balance through
            support, Counseling, and care.
          </p>
          <div className="space-y-2">
            <Link
              href="/misc/privacy-policy"
              className="flex items-center gap-2"
            >
              <p>Privacy Policy</p>
              <ArrowUpRight strokeWidth={1.25} />
            </Link>
            <Link
              href="/misc/meet-the-developers"
              className="flex items-center gap-2"
            >
              <p>Meet the Developers</p>
              <ArrowUpRight strokeWidth={1.25} />
            </Link>
          </div>
        </div>
        <div className="flex gap-20">
          <div className="space-y-10">
            <p className="font-medium">Fast Links</p>
            <div className="flex flex-col gap-4">
              {navBarObj && navBarObj.length > 0 ? (
                navBarObj.map((nav) => (
                  <Link key={nav.link} href={nav.link}>
                    {nav.title}
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/">Home</Link>
                  <Link href="/about">About</Link>
                  <Link href="/services">Services</Link>
                </>
              )}
            </div>
          </div>
          <div className="space-y-10">
            <p className="font-medium">Contact Info</p>
            <div className="flex flex-col gap-4">
              {organization?.office_location && (
                <div className="flex items-start gap-2">
                  <Home size={20} strokeWidth={1} />
                  <p className="text-sm">{organization.office_location}</p>
                </div>
              )}
              {organization?.email && (
                <div className="flex items-start gap-2">
                  <Mail size={20} strokeWidth={1} />
                  <a href={`mailto:${organization.email}`} className="text-sm">{organization.email}</a>
                </div>
              )}
              {organization?.phone && (
                <div className="flex items-start gap-2">
                  <Phone size={20} strokeWidth={1} />
                  <a href={`tel:${String(organization.phone).replace(/\D/g, "")}`} className="text-sm">0{organization.phone}</a>
                </div>
              )}
              {organization?.start_office_hour && organization?.end_office_hour && (
                <div className="flex items-start gap-2">
                  <CalendarCheck2 size={20} strokeWidth={1} />
                  <p className="text-sm">{parseTime(organization.start_office_hour)} - {parseTime(organization.end_office_hour)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
