import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  Handshake,
  HeartPulse,
  LibraryBig,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EarlyAccessNotice } from "@/components/app/early-access-notice";
import { IconBadge } from "@/components/app/icon-badge";
import { createClient } from "@/utils/supabase/server";
import { formatEventRange } from "@/lib/format";
import { CAMPUS_ADDRESS } from "@/lib/organization/address";
import hero from "@/assets/hero.jpg";
import { AboutMosaic } from "./_components/about-mosaic";
import { SectionIntro } from "./_components/section-intro";

const SERVICES = [
  {
    icon: GraduationCap,
    title: "Counseling",
    description:
      "Personal sessions for academic, emotional or personal concerns.",
  },
  {
    icon: Handshake,
    title: "Career guidance",
    description: "Discover your strengths, career paths and goals.",
  },
  {
    icon: HeartPulse,
    title: "Mental health support",
    description: "Wellness programs and referrals for psychological support.",
  },
  {
    icon: LibraryBig,
    title: "Academic advising",
    description: "Guidance through academic challenges and big decisions.",
  },
];

/**
 * The public landing page, rendered on the server with live content.
 *
 * It used to be a client page that fetched its content in the browser, so search
 * engines saw placeholder text, and it filled gaps with invented articles ("Love
 * Will Always Win") and links that pointed nowhere.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [
    { data: organization },
    { data: article },
    { data: activity },
    { data: playlist },
    { data: events },
  ] = await Promise.all([
    supabase
      .from("organization")
      .select("office_location, email")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("article")
      .select("title, author_name, article_image")
      .order("added_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // A past event, so the About tile doesn't repeat "Upcoming events" below.
    supabase
      .from("announcement")
      .select("title, location, announcement_image")
      .lt("end_date", now)
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("playlist")
      .select("title, creator, image")
      .order("title")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("announcement")
      .select("id, title, location, start_date, end_date, announcement_image")
      .gte("end_date", now)
      .order("start_date")
      .limit(3),
  ]);

  return (
    <div className="flex flex-col gap-24 pb-24 md:gap-32">
      {/* Hero */}
      <section
        id="home"
        aria-labelledby="hero-title"
        className="flex scroll-mt-24 flex-col gap-8 pt-10 md:pt-16"
      >
        <EarlyAccessNotice />
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          <div className="max-w-3xl space-y-5">
            <h1
              id="hero-title"
              className="text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
            >
              Nurturing student growth and well-being
            </h1>
            <p className="text-muted-foreground max-w-xl text-base">
              Steady supports every student&apos;s emotional, psychological and
              academic balance through counseling, programs and care.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/student/appointment">
                  Book an appointment
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/portal">Visit the portal</Link>
              </Button>
            </div>
          </div>
          <div className="bg-card w-full rounded-2xl border lg:max-w-sm">
            <div className="flex items-center gap-3 border-b p-4">
              <IconBadge icon={MapPin} />
              <h2 className="font-medium">Find us</h2>
            </div>
            <div className="space-y-4 p-4">
              <address className="space-y-1 not-italic">
                <p className="font-medium">{CAMPUS_ADDRESS}</p>
                {organization?.office_location && (
                  <p className="text-muted-foreground">
                    {organization.office_location}
                  </p>
                )}
              </address>
            </div>
          </div>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl md:aspect-[21/8] md:rounded-4xl">
          <Image
            src={hero}
            alt="Students gathered at a campus event"
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 1400px) 1400px, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        aria-labelledby="about-title"
        className="flex scroll-mt-24 flex-col gap-10"
      >
        <SectionIntro eyebrow="About us" title="Who we are" id="about-title">
          <p>
            Steady brings your guidance and counseling office online: a
            welcoming space and responsive services that help students succeed
            academically and emotionally.
          </p>
        </SectionIntro>
        <AboutMosaic
          article={article}
          activity={activity}
          playlist={playlist}
        />
      </section>

      {/* Services */}
      <section
        id="service"
        aria-labelledby="service-title"
        className="grid scroll-mt-24 gap-10 lg:grid-cols-2"
      >
        <div className="flex flex-col gap-8">
          <SectionIntro
            eyebrow="Services"
            title="What we do"
            id="service-title"
            align="start"
          >
            <p>Support for every part of student life.</p>
          </SectionIntro>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {SERVICES.map(({ icon, title, description }) => (
              <li
                key={title}
                className="bg-card flex gap-4 rounded-2xl border p-5"
              >
                <IconBadge icon={icon} />
                <div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* The photo has no height of its own (fill is absolutely positioned), so
            the row takes the list's height and the photo stretches to match it.
            A fixed 4:5 ratio made it far taller than the list. */}
        <div className="bg-card relative hidden overflow-hidden rounded-4xl border p-3 lg:block">
          <div className="relative h-full overflow-hidden rounded-3xl">
            <Image
              src="/auth.jpg"
              alt=""
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section
        id="announcement"
        aria-labelledby="announcement-title"
        className="flex scroll-mt-24 flex-col gap-10"
      >
        <SectionIntro
          eyebrow="Announcements"
          title="Upcoming events"
          id="announcement-title"
        >
          <p>Wellness programs, workshops and campus-wide initiatives.</p>
        </SectionIntro>
        {events && events.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href="/portal#announcements"
                className="group bg-card hover:bg-muted/40 focus-visible:ring-ring/50 flex flex-col gap-3 rounded-2xl border p-2 transition-colors outline-none focus-visible:ring-[3px]"
              >
                <span className="bg-muted relative block aspect-[16/10] overflow-hidden rounded-xl">
                  <Image
                    src={event.announcement_image || "/placeholder.png"}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </span>
                <span className="flex flex-col gap-1 px-2 pb-2">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-muted-foreground flex items-center gap-2 text-xs">
                    <CalendarDays aria-hidden className="size-3.5" />
                    {formatEventRange(event.start_date, event.end_date)}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-2 text-xs">
                    <MapPin aria-hidden className="size-3.5" />
                    {event.location}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">
            No upcoming events right now. Check back soon.
          </p>
        )}
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/portal#announcements">
              See all announcements
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      {/* Appointment */}
      <section
        id="appointment"
        aria-labelledby="appointment-title"
        className="bg-card scroll-mt-24 rounded-3xl border px-6 py-14 md:rounded-4xl md:py-20"
      >
        <SectionIntro
          eyebrow="Appointment"
          title="Talk to a counselor"
          id="appointment-title"
        >
          <p>Book online in a minute. No waiting lines or paperwork.</p>
        </SectionIntro>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/student/appointment">
              Book an appointment
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          {organization?.email && (
            <Button size="lg" variant="outline" asChild>
              <a href={`mailto:${organization.email}`}>Email the office</a>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
