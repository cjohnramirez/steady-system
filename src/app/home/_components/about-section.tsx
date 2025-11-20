import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
  return (
    <section id="about"> 
      <div className="m-auto flex h-1/2 max-w-[600px] flex-col items-center justify-center space-y-4 text-center py-20">
        <div className="rounded-xl border-1 border-gray-200 bg-white px-10 py-2">
          About Us
        </div>
        <p className="mt-5 text-4xl">Who We Are</p>
        <p>
          The Guidance and Counseling Services forms an essential part of the
          University's education program, offering a client-friendly environment
          and responsive services that help students succeed academically and
          emotionally.
        </p>
        <p>
          Through one-on-one counseling, group mentoring, and developmental
          programs, GCS ensures that every student receives the guidance they
          need to thrive.
        </p>
      </div>
      <div className="grid h-3/5 grid-cols-4 grid-rows-2 gap-4">
        <div className="from-brand-normal to-brand-light col-span-2 h-full rounded-2xl border-1 border-gray-200 bg-amber-200 bg-linear-to-br antialiased">
          <div className="relative flex h-full w-full justify-between p-8">
            <Image
              src="/placeholder.png"
              alt="placeholder"
              fill
              className="rounded-4xl object-cover p-4"
              sizes=""
            />
            <div className="z-10 w-36 rounded-xl border-1 border-gray-200 bg-white px-10 py-2 h-fit">
              <p className="text-center">Activity</p>
            </div>
            <Link
              className="z-10 flex flex-col gap-4 rounded-2xl bg-white p-6 justify-between w-60"
              href=""
            >
              <ArrowUpRight
                className="rounded-full border-1 border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">
                  Love Will Always Win
                </p>
                <p>by Alicia Montero</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="from-brand-normal to-brand-light col-span-2 row-span-2 flex h-full items-center rounded-2xl border-1 border-gray-200 bg-amber-100 bg-linear-to-tl">
          <div className="relative flex h-full w-full flex-col justify-between p-8">
            <Image
              src="/placeholder.png"
              alt="placeholder"
              fill
              className="rounded-4xl object-cover p-4"
              sizes=""
            />
            <div className="z-10 w-36 rounded-xl border-1 border-gray-200 bg-white px-10 py-2">
              <p className="text-center">Activity</p>
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
                  GCS offers mental health support in the wake of recent
                  earthquakes
                </p>
                <p>October 16, 2025</p>
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
                <p className="font-medium">See Activities</p>
                <p>Know what GCS do</p>
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
                <p className="font-medium">View Events</p>
                <p>Be aware of what GCS offers</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
