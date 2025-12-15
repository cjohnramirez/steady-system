"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestAnnouncement, fetchLatestArticle } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { CldImage } from "next-cloudinary";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeSection() {
  const supabase = createClient();

  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ["latest-article"],
    queryFn: () => fetchLatestArticle(supabase),
  });

  const { data: announcement, isLoading: announcementLoading } = useQuery({
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
        {articleLoading ? (
          <div className="flex h-2/3 items-center rounded-xl bg-white">
            <div className="relative flex h-full w-full flex-col justify-between p-8">
              <Skeleton className="h-full w-full rounded-4xl" />
              <div className="z-10 flex h-fit gap-4 rounded-xl bg-white pt-6">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        ) : article ? (
          <div className="flex h-2/3 items-center rounded-xl bg-white">
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
                href="/portal#articles"
              >
                <ArrowUpRight
                  className="rounded-full border border-gray-200 p-2"
                  size={40}
                  strokeWidth={1.25}
                />
                <div>
                  <p className="font-medium">{article?.title}</p>
                  <p>{article?.author_name}</p>
                </div>
              </Link>
            </div>
          </div>
        ) : null}
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
      <div className="flex h-full flex-col gap-4">
        <div className="flex h-1/4 flex-col justify-center rounded-xl border border-gray-200 bg-white p-8">
          <p className="font-medium">Purpose</p>
          <p>
            A unified portal for curated content and public announcements from
            the Guidance and Counseling Services
          </p>
        </div>
        {announcementLoading ? (
          <div className="h-3/4 rounded-xl bg-white">
            <div className="relative flex h-full w-full flex-col justify-between p-4">
              <Skeleton className="h-full w-full rounded-4xl" />
              <div className="z-10 flex h-fit gap-4 rounded-xl bg-white pt-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        ) : announcement ? (
          <div className="h-3/4 rounded-xl border border-gray-200 bg-white">
            <div className="relative flex h-full w-full flex-col justify-between p-8">
              {announcement?.announcement_image ? (
                <CldImage
                  src={announcement.announcement_image}
                  alt={announcement.title || "Announcement image"}
                  fill
                  className="rounded-4xl object-cover p-4"
                />
              ) : (
                <Image
                  src="/placeholder.png"
                  alt="placeholder"
                  fill
                  className="rounded-4xl object-cover p-4"
                />
              )}
              <div className="z-10 w-52 rounded-xl border border-gray-200 bg-white px-5 py-2">
                <p className="text-center">Most Recent Event</p>
              </div>
              <Link
                className="z-10 flex gap-4 rounded-xl bg-white px-6 py-8"
                href="/portal#announcements"
              >
                <ArrowUpRight
                  className="rounded-full border border-gray-200 p-2"
                  size={40}
                  strokeWidth={1.25}
                />
                <div>
                  <p className="font-medium">{announcement?.title}</p>
                  <p>{announcement?.location}</p>
                </div>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
