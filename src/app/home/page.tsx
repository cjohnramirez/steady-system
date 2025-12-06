import AboutSection from "./_components/about-section";
import AnnouncementSection from "./_components/annoucement-section";
import AppointmentSection from "./_components/appointment-section";
import HomeSection from "./_components/home-section";
import ServiceSection from "./_components/service-section";

export default function HomePage() {
  return (
    <>
      <HomeSection />
      <AboutSection />
      <ServiceSection />
      <AnnouncementSection />
      <AppointmentSection />
    </>
  );
}
