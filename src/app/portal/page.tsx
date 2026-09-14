import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Megaphone, Music } from "lucide-react";
import { IconBadge } from "@/components/app/icon-badge";
import { createClient } from "@/utils/supabase/server";
import { getViewer } from "@/lib/auth/get-viewer";
import { fetchMoodByName } from "@/lib/content/queries";
import { formatEventRange, strToTitleCase } from "@/lib/format";
import AnnouncementSection from "./_components/announcement-section";
import ArticleSection from "./_components/article-section";
import PlaylistSection from "./_components/playlist-section";

export const metadata: Metadata = {
  title: "GCS Portal | Articles, events and playlists",
  description:
    "Curated reading, music and upcoming events from the Guidance and Counseling Services.",
};

const SECTIONS = [
  {
    href: "#announcements",
    label: "Announcements and events",
    icon: Megaphone,
  },
  { href: "#articles", label: "Articles", icon: BookOpen },
  { href: "#playlists", label: "Playlists", icon: Music },
];

/**
 * The hero is rendered on the server, so the featured article and next event are in
 * the HTML rather than popping in after two client requests.
 */
export default async function PortalPage() {
  const supabase = await createClient();
  const viewer = await getViewer();

  const [{ data: article }, { data: event }, mood] = await Promise.all([
    supabase
      .from("article")
      .select("*")
      .order("added_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("announcement")
      .select("*")
      .gte("end_date", new Date().toISOString())
      .order("start_date")
      .limit(1)
      .maybeSingle(),
    fetchMoodByName(supabase, viewer?.emotionalStatus ?? null),
  ]);

  return (
    <>
      <section
        id="home"
        className="grid scroll-mt-24 grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <div className="space-y-3 py-4">
            <h1 className="text-4xl tracking-tight md:text-6xl">GCS Portal</h1>
            <p className="text-muted-foreground max-w-xl">
              {mood
                ? `Reading and music picked for when you're feeling ${mood.name}, plus what's coming up at the guidance office.`
                : "Curated reading, music and upcoming events from the Guidance and Counseling Services."}
            </p>
          </div>
          {article && (
            <FeatureCard
              href="#articles"
              image={article.article_image}
              eyebrow="Latest article"
              title={article.title}
              subtitle={article.author_name}
              priority
            />
          )}
          <nav
            aria-label="Portal sections"
            className="grid gap-3 sm:grid-cols-3"
          >
            {SECTIONS.map(({ href, label, icon }) => (
              <a
                key={href}
                href={href}
                className="bg-card hover:bg-muted/60 focus-visible:ring-ring/50 flex items-center gap-3 rounded-2xl border p-4 transition-colors outline-none focus-visible:ring-[3px]"
              >
                <IconBadge icon={icon} size="sm" />
                <span className="font-medium">{label}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="font-medium">What this portal is for</h2>
            <p className="text-muted-foreground mt-1">
              One place for the guidance office&apos;s recommended reading,
              playlists and public announcements.{" "}
              {mood && (
                <>
                  Showing picks for{" "}
                  <span className="text-foreground">
                    {strToTitleCase(mood.name)}
                  </span>
                  ; change your mood on your{" "}
                  <Link
                    href="/student"
                    className="text-foreground underline underline-offset-4"
                  >
                    dashboard
                  </Link>
                  .
                </>
              )}
            </p>
          </div>
          {event && (
            <FeatureCard
              href="#announcements"
              image={event.announcement_image}
              eyebrow="Next event"
              title={event.title}
              subtitle={`${formatEventRange(event.start_date, event.end_date)} · ${event.location}`}
              className="flex-1"
            />
          )}
        </div>
      </section>

      <AnnouncementSection />
      <ArticleSection defaultMoodId={mood?.id} />
      <PlaylistSection defaultMoodId={mood?.id} />
    </>
  );
}

function FeatureCard({
  href,
  image,
  eyebrow,
  title,
  subtitle,
  priority,
  className = "",
}: {
  href: string;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`group bg-card focus-visible:ring-ring/50 relative flex min-h-72 flex-col justify-between overflow-hidden rounded-3xl border p-4 outline-none focus-visible:ring-[3px] md:min-h-96 ${className}`}
    >
      <Image
        src={image || "/placeholder.png"}
        alt=""
        fill
        priority={priority}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <span className="bg-card/95 relative w-fit rounded-full border px-3 py-1 text-xs">
        {eyebrow}
      </span>
      <span className="bg-card/95 relative flex items-center gap-4 rounded-2xl p-4 backdrop-blur">
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{title}</span>
          <span className="text-muted-foreground block truncate">
            {subtitle}
          </span>
        </span>
        <ArrowUpRight
          aria-hidden
          strokeWidth={1.25}
          className="size-6 shrink-0"
        />
      </span>
    </a>
  );
}
