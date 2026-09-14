import Link from "next/link";
import { Clock, Globe, Mail, MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/app/brand-mark";
import { createClient } from "@/utils/supabase/server";
import { formatClockTime, strToTitleCase } from "@/lib/format";
import { CAMPUS_ADDRESS } from "@/lib/organization/address";
import type { NavBar } from "@/app/home/_lib/nav-data";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Site footer, rendered on the server.
 *
 * Fixed: it was a client component purely to fetch office details, prefixed a
 * literal "0" to the phone number, and fell back to /about and /services, which
 * never existed.
 */
export default async function Footer({
  navBarObj = [],
}: {
  navBarObj?: NavBar[];
}) {
  const supabase = await createClient();
  const [{ data: organization }, { data: contacts }] = await Promise.all([
    supabase.from("organization").select("*").limit(1).maybeSingle(),
    supabase
      .from("organization_contact")
      .select("id, platform, contact_detail")
      .order("platform"),
  ]);

  const openDays = organization?.day_of_week
    ?.map((open, i) => (open ? DAYS[i] : null))
    .filter(Boolean)
    .join(", ");

  const links = (contacts ?? []).filter((c) =>
    /^https?:\/\//.test(c.contact_detail),
  );

  return (
    <footer className="bg-card border-t">
      <div className="m-auto grid max-w-[1600px] gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1.5fr] md:px-8 md:py-16">
        <div className="max-w-sm space-y-4">
          <BrandMark
            label={organization?.name ?? "Guidance and Counseling Services"}
          />
          <p className="text-muted-foreground">
            Dedicated to the holistic development of every student through
            support, counseling and care.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            <li>
              <Link
                href="/misc/privacy-policy"
                className="underline-offset-4 hover:underline"
              >
                Privacy policy
              </Link>
            </li>
            <li>
              <Link
                href="/misc/meet-the-developers"
                className="underline-offset-4 hover:underline"
              >
                Meet the developers
              </Link>
            </li>
          </ul>
        </div>

        {navBarObj.length > 0 && (
          <nav aria-labelledby="footer-links">
            <h2 id="footer-links" className="mb-4 font-medium">
              On this page
            </h2>
            <ul className="text-muted-foreground space-y-2">
              {navBarObj.map((item) => (
                <li key={item.link}>
                  <a href={item.link} className="hover:text-foreground">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {organization && (
          <address className="not-italic">
            <h2 className="mb-4 font-medium">Contact</h2>
            <ul className="text-muted-foreground space-y-3">
              <li className="flex gap-2">
                <MapPin
                  aria-hidden
                  strokeWidth={1.5}
                  className="mt-0.5 size-4 shrink-0"
                />
                <span>
                  {CAMPUS_ADDRESS}
                  <span className="block">{organization.office_location}</span>
                </span>
              </li>
              <li className="flex gap-2">
                <Mail
                  aria-hidden
                  strokeWidth={1.5}
                  className="mt-0.5 size-4 shrink-0"
                />
                <a
                  href={`mailto:${organization.email}`}
                  className="hover:text-foreground"
                >
                  {organization.email}
                </a>
              </li>
              <li className="flex gap-2">
                <Phone
                  aria-hidden
                  strokeWidth={1.5}
                  className="mt-0.5 size-4 shrink-0"
                />
                <a
                  href={`tel:${String(organization.phone).replace(/[^\d+]/g, "")}`}
                  className="hover:text-foreground"
                >
                  {organization.phone}
                </a>
              </li>
              <li className="flex gap-2">
                <Clock
                  aria-hidden
                  strokeWidth={1.5}
                  className="mt-0.5 size-4 shrink-0"
                />
                {openDays}, {formatClockTime(organization.start_office_hour)} –{" "}
                {formatClockTime(organization.end_office_hour)}
              </li>
              {links.map((link) => (
                <li key={link.id} className="flex gap-2">
                  <Globe
                    aria-hidden
                    strokeWidth={1.5}
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <a
                    href={link.contact_detail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    {strToTitleCase(link.platform)}
                  </a>
                </li>
              ))}
            </ul>
          </address>
        )}
      </div>
    </footer>
  );
}
