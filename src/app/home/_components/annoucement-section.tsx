import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AnnouncementSection() {
  return (
    <section id="announcement">
      <div className="m-auto flex h-1/2 max-w-[600px] flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="rounded-xl border-1 border-gray-200 bg-white px-10 py-2">
          Annoucements
        </div>
        <p className="mt-5 text-4xl">Announcements & Events</p>
        <p>
          Stay informed about upcoming events, wellness programs, and
          university-wide mental health initiatives.
        </p>
      </div>
      <div className="grid h-3/5 grid-cols-4 grid-rows-2 gap-4">
        <div className="from-brand-normal to-brand-light col-span-2 row-span-2 flex h-full items-center rounded-2xl border-1 border-gray-200 bg-amber-100 bg-linear-to-tl">
          <div className="relative flex h-full w-full flex-col justify-between p-8">
            <Image
              src="/placeholder.png"
              alt="placeholder"
              fill
              className="rounded-4xl object-cover p-4"
              sizes=""
            />
            <div className="z-10 w-36 rounded-xl border-1 border-gray-200 bg-white p-2">
              <p className="text-center">Annoucements</p>
            </div>
            <Link
              className="z-10 flex gap-4 rounded-2xl bg-white px-6 py-8"
              href=""
            >
              <ArrowUpRight
                className="rounded-full border-1 border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">
                  USTP CDO announces wellness week for students to relax post-midterm
                </p>
                <p>November 6, 2025</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="from-brand-normal to-brand-light h-full rounded-2xl border-1 border-gray-200 bg-amber-100 bg-linear-to-tr">
          <div className="h-full p-4">
            <Link
              className="flex h-full flex-col justify-between rounded-2xl bg-white px-6 py-8"
              href=""
            >
              <ArrowUpRight
                className="rounded-full border-1 border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">World Mental Health Day</p>
                <p>October 10 </p>
              </div>
            </Link>
          </div>
        </div>
        <div className="from-brand-normal to-brand-light h-full rounded-2xl border-1 border-gray-200 bg-amber-100 bg-linear-to-tl">
          <div className="h-full p-4">
            <Link
              className="flex h-full flex-col justify-between rounded-2xl bg-white px-6 py-8"
              href=""
            >
              <ArrowUpRight
                className="rounded-full border-1 border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">See More!</p>
                <p>And stay tuned always</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="from-brand-normal to-brand-light col-span-2 h-full rounded-2xl border-1 border-gray-200 bg-amber-200 bg-linear-to-br antialiased">
          <div className="relative flex h-full w-full justify-between p-8">
            <Image
              src="/placeholder.png"
              alt="placeholder"
              fill
              className="rounded-4xl object-cover p-4"
              sizes=""
            />
            <div className="z-10 h-fit w-36 rounded-xl border-1 border-gray-200 bg-white px-10 py-2">
              <p className="text-center">Events</p>
            </div>
            <Link
              className="z-10 flex w-60 flex-col justify-between gap-4 rounded-2xl bg-white p-6"
              href=""
            >
              <ArrowUpRight
                className="rounded-full border-1 border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">LGBTQ+ Parade</p>
                <p>June 21, Monday</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
