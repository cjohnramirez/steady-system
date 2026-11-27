import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection } from "@/components/legal/legal-section";
import { BRAND } from "@/lib/brand";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = { title: "Privacy policy" };

/**
 * Written against what the app actually stores. The previous text described
 * features the site never had (Google Calendar reminders, "Notify Me" emails,
 * Mailgun), so update it whenever a new kind of data is collected.
 */
export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy policy"
      summary={`What ${BRAND.name} collects, who can see it, and the choices you have. ${BRAND.name} is in early access and its content is sample data.`}
    >
      <LegalSection title="What we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium">Your account:</strong> name,
            username, email address and password. Passwords are stored hashed by
            our sign-in provider, so nobody can read them.
          </li>
          <li>
            <strong className="font-medium">Your student profile:</strong> phone
            number, gender, age, college, department, year level, university ID
            and an optional profile photo.
          </li>
          <li>
            <strong className="font-medium">Emergency contacts:</strong> the
            names and phone numbers of the people you list.
          </li>
          <li>
            <strong className="font-medium">Counseling activity:</strong>{" "}
            appointment times, the reason you choose, each appointment&apos;s
            status, and notes your counselor adds.
          </li>
          <li>
            <strong className="font-medium">Mood check-ins:</strong> the mood
            you last selected, used to suggest articles and playlists.
          </li>
          <li>
            <strong className="font-medium">Notifications</strong> about your
            appointments, and when you last used the site.
          </li>
          <li>
            <strong className="font-medium">Usage totals:</strong> daily counts
            of visits and sign-ins. These are totals only and are not linked to
            you.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use it">
        <p>
          To run your account, match you with the counselor for your department,
          schedule and manage appointments, notify you when an appointment
          changes, suggest resources for how you feel, keep the service secure,
          and understand overall usage. We do not sell, rent or trade your
          information, and we do not use it for advertising.
        </p>
      </LegalSection>

      <LegalSection title="Who can see it">
        <ul className="list-disc space-y-2 pl-5">
          <li>You can see and edit your own profile and contacts.</li>
          <li>
            The counselor assigned to your department can see your profile,
            emergency contacts and your appointments with them.
          </li>
          <li>
            Guidance office administrators can manage accounts and see
            appointment records to run the office.
          </li>
          <li>
            Nobody else. These limits are enforced by access rules in the
            database, not only by the pages you see.
          </li>
        </ul>
        <p>
          Counselors may still need to share information in the situations
          described in the{" "}
          <Link
            href="/misc/terms"
            className="text-primary dark:text-brand-light underline underline-offset-4"
          >
            terms and informed consent
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Service providers">
        <p>
          {BRAND.name} relies on Supabase for its database, sign-in and live
          notifications, Vercel for hosting, and Cloudinary for storing images.
          They process data only to provide those services to us.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and local storage">
        <p>
          We use cookies to keep you signed in, and your browser&apos;s local
          storage to remember your theme and to count a visit once per day. We
          use no advertising or third-party tracking cookies. Blocking cookies
          will sign you out.
        </p>
        <p>
          Device notifications are optional. They are only shown after you turn
          them on from the notifications menu, and you can switch them off in
          your browser or device settings at any time.
        </p>
      </LegalSection>

      <LegalSection title="Security and retention">
        <p>
          Data travels over HTTPS, access is limited by role, and we collect
          only what the service needs. No system is completely secure, so we
          cannot guarantee absolute security. We keep your information while
          your account is active and delete it when you ask, unless a record
          must be kept for safety or legal reasons.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Under the Data Privacy Act of 2012 (Republic Act No. 10173), you can
          ask to access, correct, download or delete your data, object to how it
          is used, and file a complaint with the National Privacy Commission.
          You can update most profile details yourself; for anything else, email
          us.
        </p>
      </LegalSection>

      <LegalSection title="Students under 18">
        <p>
          If you are under 18, ask a parent or guardian before creating an
          account. Parents and guardians have a legal right to information about
          counseling with a minor.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>We will post any changes on this page and update the date below.</p>
      </LegalSection>
    </LegalPage>
  );
}
