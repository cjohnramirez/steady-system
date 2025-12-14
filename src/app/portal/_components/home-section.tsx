"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestAnnouncement, fetchLatestArticle } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { CldImage } from "next-cloudinary";

export default function HomeSection() {
  const supabase = createClient();

  const { data: article } = useQuery({
    queryKey: ["latest-article"],
    queryFn: () => fetchLatestArticle(supabase),
  });

  const { data: announcement } = useQuery({
    queryKey: ["latest-announcement"],
    queryFn: () => fetchLatestAnnouncement(supabase),
  });
  
  return (
    <section
      className="grid h-[calc(100dvh-210px)] min-h-[600px] grid-cols-[850px_1fr] gap-4"
      id="home"
    >
      <div className="flex flex-col gap-4">
        <p className="mb-5 text-6xl">GCS Portal</p>
        <div className="flex h-2/3 items-center rounded-xl border border-gray-200 bg-white">
          <div className="relative flex h-full w-full flex-col justify-between p-8">
            {article?.article_image ? (
              <CldImage
                src={article.article_image}
                alt={article.title || "Article image"}
                fill
                className="rounded-4xl object-cover p-4"
              />
            ) : (
              <Image
                src="/placeholder.png"
                alt="placeholder"
                fill
                className="rounded-4xl object-cover p-4"
                sizes="100vw"
              />
            )}
            <div className="z-10 w-48 rounded-xl border border-gray-200 bg-white px-10 py-2">
              <p className="text-center">Featured Article</p>
            </div>
            <Link
              className="z-10 flex gap-4 rounded-xl bg-white px-6 py-8"
              href={article ? `/portal#articles` : ""}
            >
              <ArrowUpRight
                className="rounded-full border border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">
                  {article?.title || "Why does everything feels so heavy?"}
                </p>
                <p>{article?.author_name || "by Alicia Montero"}</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_300px_1fr] gap-4">
          <div className="h-full rounded-xl border border-gray-200 bg-white">
            <Link
              className="flex h-full items-center gap-4 rounded-xl px-6 py-8"
              href="/portal#articles"
            >
              <ArrowUpRight
                className="rounded-full border border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">Articles</p>
              </div>
            </Link>
          </div>
          <div className="h-full w-full rounded-xl border border-gray-200 bg-white">
            <Link
              className="flex h-full items-center gap-4 rounded-xl px-6 py-8"
              href="/portal#announcements"
            >
              <ArrowUpRight
                className="rounded-full border border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">Announcements and Events</p>
              </div>
            </Link>
          </div>
          <div className="h-full rounded-xl border border-gray-200 bg-white">
            <Link
              className="flex h-full items-center gap-4 rounded-xl px-6 py-8"
              href="/portal#playlists"
            >
              <ArrowUpRight
                className="rounded-full border border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">Playlists</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 h-full">
        <div className="h-1/4 rounded-xl border border-gray-200 bg-white p-8 flex flex-col justify-center">
          <p className="font-medium">Purpose</p>
          <p>
            A unified portal for curated content and public announcements from
            the Guidance and Counseling Services
          </p>
        </div>
        <div className="h-3/4 rounded-xl border border-gray-200 bg-white">
          <div className="relative flex h-full w-full flex-col justify-between p-8">
            {announcement?.announcement_image ? (
              <CldImage
                src={announcement.announcement_image}
                alt={announcement.title || "Announcement image"}
                fill
                className="object-cover rounded-4xl p-4"
              />
            ) : (
              <Image
                src="/placeholder.png"
                alt="placeholder"
                fill
                className="object-cover rounded-4xl p-4"
              />
            )}
            <div className="z-10 w-52 rounded-xl border border-gray-200 bg-white px-5 py-2">
              <p className="text-center">Most Recent Event</p>
            </div>
            <Link
              className="z-10 flex gap-4 rounded-xl bg-white px-6 py-8"
              href={announcement ? `/portal#announcements` : ""}
            >
              <ArrowUpRight
                className="rounded-full border border-gray-200 p-2"
                size={40}
                strokeWidth={1.25}
              />
              <div>
                <p className="font-medium">
                  {announcement?.title || "Why does everything feels so heavy?"}
                </p>
                <p>{announcement?.location || "by Alicia Montero"}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
