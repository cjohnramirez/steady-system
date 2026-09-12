"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchArticlesByEmotion } from "@/app/portal/actions";
import { createClient } from "@/utils/supabase/client";
import { CldImage } from "next-cloudinary";

export default function AboutSection() {
  const supabase = createClient();

  const { data: articlesData } = useQuery({
    queryKey: ["articles-by-emotion"],
    queryFn: () => fetchArticlesByEmotion(supabase, 0, 3, "", ""),
  });

  const articles = articlesData?.data || [];
  return (
    <section id="about">
      <div className="m-auto flex h-1/2 max-w-[600px] flex-col items-center justify-center space-y-4 py-20 text-center">
        <div className="rounded-xl border border-gray-200 bg-white px-10 py-2">
          About Us
        </div>
        <p className="mt-5 text-4xl">Who We Are</p>
        <p>
          The Guidance and Counseling Services forms an essential part of the
          University&apos;s education program, offering a client-friendly
          environment and responsive services that help students succeed
          academically and emotionally.
        </p>
        <p>
          Through one-on-one Counseling, group mentoring, and developmental
          programs, GCS ensures that every student receives the guidance they
          need to thrive.
        </p>
      </div>
      <div className="grid h-3/5 grid-cols-4 grid-rows-2 gap-4">
        <div className="col-span-2 h-full rounded-2xl border border-gray-200 bg-white">
          <div className="relative flex h-full w-full justify-between p-8">
            {articles[0]?.article_image ? (
              <CldImage
                src={articles[0].article_image}
                alt={articles[0].title || "Article image"}
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
            <div className="z-10 h-fit w-fit rounded-xl border border-gray-200 bg-white px-4 py-1">
              <p className="text-center text-sm">Activity</p>
            </div>
            <Link
              className="z-10 flex w-60 flex-col justify-between gap-4 rounded-2xl bg-white p-6"
              href={articles[0] ? `/portal#articles` : ""}
            >
              <ArrowUpRight
                className="rounded-full border border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">
                  {articles[0]?.title || "Love Will Always Win"}
                </p>
                <p>{articles[0]?.author_name || "by Alicia Montero"}</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="col-span-2 row-span-2 flex h-full items-center rounded-2xl border border-gray-200 bg-white">
          <div className="relative flex h-full w-full flex-col justify-between p-8">
            {articles[1]?.article_image ? (
              <CldImage
                src={articles[1].article_image}
                alt={articles[1].title || "Article image"}
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
            <div className="z-10 w-fit rounded-xl border border-gray-200 bg-white px-4 py-1">
              <p className="text-center text-sm">Activity</p>
            </div>
            <Link
              className="z-10 flex gap-4 rounded-2xl bg-white px-6 py-8"
              href={articles[1] ? `/portal#articles` : ""}
            >
              <ArrowUpRight
                className="rounded-full border border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">
                  {articles[1]?.title ||
                    "GCS offers mental health support in the wake of recent earthquakes"}
                </p>
                <p>{articles[1]?.author_name || "October 16, 2025"}</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="h-full rounded-2xl border border-gray-200">
          <Link
            className="flex h-full flex-col justify-between rounded-2xl bg-white px-6 py-8"
            href={articles[2] ? `/portal#articles` : "/portal#articles"}
          >
            <ArrowUpRight
              className="rounded-full border border-gray-200 p-2"
              size={40}
              strokeWidth={1.25}
            />
            <div>
              <p className="font-medium">
                {articles[2]?.title || "See Activities"}
              </p>
              <p>{articles[2]?.author_name || "Know what GCS do"}</p>
            </div>
          </Link>
        </div>

        <div className="h-full rounded-2xl border border-gray-200">
          <Link
            className="flex h-full flex-col justify-between rounded-2xl bg-white px-6 py-8"
            href=""
          >
            <ArrowUpRight
              className="rounded-full border border-gray-200 p-2"
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
    </section>
  );
}
