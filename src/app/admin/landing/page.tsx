import AnnouncementSection from "./components/announcement-section";
import ArticleSection from "./components/article-section";
import PlaylistSection from "./components/playlist-section";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-8">
      <ArticleSection />
      <AnnouncementSection />
      <PlaylistSection />
    </div>
  );
}
