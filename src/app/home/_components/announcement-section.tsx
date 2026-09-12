"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchAnnouncementsByDate } from "@/app/portal/actions";
import { createClient } from "@/utils/supabase/client";
import { CldImage } from "next-cloudinary";

export default function AnnouncementSection() {
  const supabase = createClient();

  const { data: announcementsData } = useQuery({
    queryKey: ["latest-announcements"],
    queryFn: () => fetchAnnouncementsByDate(supabase, 0, 3, "", 365),
  });

  const announcements = announcementsData?.data || [];

  return (
    <section id="announcement">
      <div className="m-auto flex h-1/2 max-w-[600px] flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="rounded-xl border border-gray-200 bg-white px-10 py-2">
          Announcements
        </div>
        <p className="mt-5 text-4xl">Announcements & Events</p>
        <p>
          Stay informed about upcoming events, wellness programs, and
          university-wide mental health initiatives.
        </p>
      </div>
      <div className="grid h-3/5 grid-cols-4 grid-rows-2 gap-4">
        <div className="col-span-2 row-span-2 flex h-full items-center rounded-2xl border border-gray-200 bg-white">
          <div className="relative flex h-full w-full flex-col justify-between p-8">
            {announcements[0]?.announcement_image ? (
              <CldImage
                src={announcements[0].announcement_image}
                alt={announcements[0].title || "Announcement image"}
                fill
                className="rounded-4xl object-cover p-4"
                sizes=""
              />
            ) : (
              <Image
                src="/placeholder.png"
                alt="placeholder"
                fill
                className="rounded-4xl object-cover p-4"
                sizes=""
              />
            )}
            <div className="z-10 w-36 rounded-xl border border-gray-200 bg-white p-2">
              <p className="text-center">Announcements</p>
            </div>
            <Link
              className="z-10 flex gap-4 rounded-2xl bg-white px-6 py-8"
              href={announcements[0] ? `/portal#announcements` : ""}
            >
              <ArrowUpRight
                className="rounded-full border border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">
                  {announcements[0]?.title ||
                    "USTP CDO announces wellness week for students to relax post-midterm"}
                </p>
                <p>
                  {announcements[0]?.start_date
                    ? new Date(announcements[0].start_date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "November 6, 2025"}
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="h-full rounded-2xl border border-gray-200">
          <Link
            className="flex h-full flex-col justify-between rounded-2xl bg-white px-6 py-8"
            href={announcements[1] ? `/portal#announcements` : ""}
          >
            <ArrowUpRight
              className="rounded-full border border-gray-200 p-2"
              size={40}
              strokeWidth={1.25}
            />
            <div>
              <p className="font-medium">
                {announcements[1]?.title || "World Mental Health Day"}
              </p>
              <p>
                {announcements[1]?.start_date
                  ? new Date(announcements[1].start_date).toLocaleDateString()
                  : "October 10"}
              </p>
            </div>
          </Link>
        </div>

        <div className="h-full rounded-2xl border border-gray-200">
          <Link
            className="flex h-full flex-col justify-between rounded-2xl bg-white px-6 py-8"
            href="/portal#announcements"
          >
            <ArrowUpRight
              className="rounded-full border border-gray-200 p-2"
              size={40}
              strokeWidth={1.25}
            />
            <div>
              <p className="font-medium">See More!</p>
              <p>And stay tuned always</p>
            </div>
          </Link>
        </div>
        <div className="col-span-2 h-full rounded-2xl border border-gray-200 bg-white">
          <div className="relative flex h-full w-full justify-between p-8">
            {announcements[2]?.announcement_image ? (
              <CldImage
                src={announcements[2].announcement_image}
                alt={announcements[2].title || "Announcement image"}
                fill
                className="rounded-4xl object-cover p-4"
                sizes=""
              />
            ) : (
              <Image
                src="/placeholder.png"
                alt="placeholder"
                fill
                className="rounded-4xl object-cover p-4"
                sizes=""
              />
            )}
            <div className="z-10 h-fit w-fit rounded-xl border border-gray-200 bg-white px-4 py-2">
              <p className="text-center text-sm">Announcements</p>
            </div>
            <Link
              className="z-10 flex w-60 flex-col justify-between gap-4 rounded-2xl bg-white p-6"
              href={announcements[2] ? `/portal#announcements` : ""}
            >
              <ArrowUpRight
                className="rounded-full border border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">
                  {announcements[2]?.title || "LGBTQ+ Parade"}
                </p>
                <p>
                  {announcements[2]?.start_date
                    ? new Date(announcements[2].start_date).toLocaleDateString()
                    : "June 21, Monday"}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
