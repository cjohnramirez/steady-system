import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { guardPage } from "@/lib/auth/session";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import { WellnessView } from "./_components/wellness-view";

export const metadata: Metadata = {
  title: "Wellness & Self-Care",
};

export default async function StudentWellnessPage() {
  const viewer = await guardPage("student");
  const supabase = await createClient();

  const [{ data: rawArticles }, { data: rawPlaylists }] = await Promise.all([
    supabase
      .from("article")
      .select("id, title, author_name, content, link")
      .order("added_at", { ascending: false })
      .limit(12),
    supabase.from("playlist").select("id, title, creator, link").limit(9),
  ]);

  const articles = (rawArticles ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    author: a.author_name,
    mood: viewer.emotionalStatus,
    summary: a.content,
    body: a.content.split(/\n{2,}/).filter(Boolean),
    url: a.link || null,
  }));

  const playlists = (rawPlaylists ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.creator ? `Curated by ${p.creator}` : null,
    url: p.link || null,
  }));

  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Wellness & Self-Care"
        description="Curated articles, calming playlists, and guided breathing tools."
      />
      <WellnessView
        moodName={viewer.emotionalStatus}
        articles={articles}
        playlists={playlists}
      />
    </PageTransition>
  );
}
