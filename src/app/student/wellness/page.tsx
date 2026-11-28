import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { guardPage } from "@/lib/auth/session";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import { expandArticleContent } from "@/lib/wellness/expand-article";
import { WellnessView } from "./_components/wellness-view";

export const metadata: Metadata = {
  title: "Wellness Library & Soundscapes",
};

export default async function StudentWellnessPage() {
  const viewer = await guardPage("student");
  const supabase = await createClient();

  const [{ data: rawArticles }, { data: rawPlaylists }] = await Promise.all([
    supabase
      .from("article")
      .select("id, title, author_name, content, link, article_image")
      .order("added_at", { ascending: false })
      .limit(24),
    supabase.from("playlist").select("id, title, creator, link").limit(24),
  ]);

  const defaultMood = viewer.emotionalStatus
    ? viewer.emotionalStatus.charAt(0).toUpperCase() +
      viewer.emotionalStatus.slice(1)
    : "Calm";

  const articles = (rawArticles ?? []).map((a) => {
    const expanded = expandArticleContent({
      title: a.title,
      content: a.content,
      author: a.author_name,
      mood: defaultMood,
    });
    return {
      id: a.id,
      title: a.title,
      author: a.author_name,
      mood: defaultMood,
      readMinutes: expanded.readMinutes,
      summary: expanded.summary,
      body: expanded.body,
      url: a.link || null,
      imageUrl: a.article_image || null,
    };
  });

  const playlists = (rawPlaylists ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    creator: p.creator || "Steady Campus",
    url: p.link || null,
  }));

  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Wellness Library & Soundscapes"
        description="Practical coping strategies, sleep resets, and background audio curated by campus counselors"
      />
      <WellnessView articles={articles} playlists={playlists} />
    </PageTransition>
  );
}
