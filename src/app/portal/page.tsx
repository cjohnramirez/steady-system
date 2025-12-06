import AnnouncementSection from "./_components/announcement-section";
import ArticleSection from "./_components/article-section";
import HomeSection from "./_components/home-section";
import PlaylistSection from "./_components/playlist-section";

export default function PortalPage() {
  return (
    <>
      <HomeSection />
      <AnnouncementSection />
      <ArticleSection />
      <PlaylistSection />
    </>
  );
}
