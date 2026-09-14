import Link from "next/link";
import { LegalSection } from "@/components/legal/legal-section";
import { BRAND } from "@/lib/brand";

const SESSION_TERMS = [
  "Sessions usually last 45 to 60 minutes and may run longer when your concern needs it.",
  "You and your counselor agree on how often to meet; your counselor makes the final call.",
  "You share what you are comfortable sharing about the concerns affecting your life.",
  "You can ask questions before, during and after any session when something is unclear.",
  "Your counselor guides each session and may ask follow-up questions about personal, academic, emotional, career or other concerns.",
  "Either of you may end the counseling relationship at any time. Let the other know why, so it can be recorded.",
  "Counseling is free.",
  "Online sessions can be interrupted by connection problems and carry some privacy risk.",
  "What you share is kept confidential, except in the situations listed below.",
];

const EXEMPTIONS = [
  {
    title: "You may be a danger to yourself or others.",
    description:
      "Physical safety comes before confidentiality. Your counselor may warn the people who need to know to keep you or others safe.",
  },
  {
    title: "You ask for your information to be released.",
    description:
      "Confidentiality belongs to you, so you can waive it. Your counselor will release what you ask them to.",
  },
  {
    title: "A court orders the information released.",
    description:
      "A court can require records when they are needed to serve justice.",
  },
  {
    title: "Your counselor is under clinical supervision.",
    description:
      "Session details may be discussed with a supervisor. You will be told when this applies.",
  },
  {
    title: "Office staff handle your records.",
    description:
      "Guidance office personnel may see records for routine tasks such as scheduling and record-keeping.",
  },
  {
    title: "Your counselor consults other professionals.",
    description:
      "Your counselor may seek another professional opinion on your progress. You have the right to know who was consulted.",
  },
  {
    title: "Your mental health becomes part of a legal proceeding.",
    description:
      "If you raise your own mental health in a legal case, the related records may be released.",
  },
  {
    title: "Someone else is present in a session.",
    description:
      "Inviting another person into a session means what is said in front of them is no longer private.",
  },
  {
    title: "You are under 18.",
    description:
      "Parents or guardians have a legal right to information about counseling with a minor.",
  },
  {
    title: "Staff share information as part of your care.",
    description:
      "Professional staff may share details when it helps your care. You will be told when this happens.",
  },
  {
    title: "Your counselor suspects child abuse.",
    description:
      "Philippine law requires suspected child abuse to be reported.",
  },
];

/**
 * The terms of use and informed consent students accept when signing up. Rendered
 * both on /misc/terms and inside the sign-up consent dialog, so the two never drift.
 */
export function TermsContent() {
  return (
    <div>
      <LegalSection title={`About ${BRAND.name}`}>
        <p>
          {BRAND.name} is an early-access platform for booking guidance and
          counseling sessions and finding wellness resources. It is still being
          built: features may change or stop working, the content shown is
          sample data, and {BRAND.name} is not affiliated with any university.
        </p>
      </LegalSection>

      <LegalSection title={`Using ${BRAND.name}`}>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Give accurate details when you sign up and keep them current, so
            your counselor can reach you.
          </li>
          <li>
            Keep your password to yourself. You are responsible for what happens
            on your account.
          </li>
          <li>
            Book only sessions you intend to attend, and cancel ones you
            can&apos;t make so another student can take the slot.
          </li>
          <li>
            Don&apos;t misuse the service: no impersonating others, harassing
            staff or trying to reach data that isn&apos;t yours.
          </li>
          <li>
            {BRAND.name} is not an emergency service. If you or someone else is
            in immediate danger, call 911, or the National Center for Mental
            Health crisis line at 1553.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Informed consent">
        <p>
          You have the right to decide whether to enter a counseling
          relationship with a specific counselor, and to know what to expect
          before you do. Counseling is a collaboration: your counselor helps you
          set goals, work through problems that cause emotional turmoil, improve
          communication and coping skills, strengthen self-esteem and build
          healthier habits.
        </p>
      </LegalSection>

      <LegalSection title="How sessions work">
        <ul className="list-disc space-y-2 pl-5">
          {SESSION_TERMS.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="When information may be shared">
        <p>
          Your counselor keeps what you share confidential, but may discuss
          parts of your case with a supervisor or colleague, and must disclose
          information in these situations:
        </p>
        <ul className="grid gap-3 md:grid-cols-2">
          {EXEMPTIONS.map((item) => (
            <li
              key={item.title}
              className="space-y-1 rounded-xl border p-4 md:last:odd:col-span-2"
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-xs">
          Adapted from Villar (2009), the American Counseling Association
          (2021), and Arthur and Swanson (1993) as cited by Bissell and Royce
          (1992).
        </p>
      </LegalSection>

      <LegalSection title="Your data">
        <p>
          How your profile, appointments and notifications are stored, and who
          can see them, is set out in the{" "}
          <Link
            href="/misc/privacy-policy"
            target="_blank"
            className="text-primary dark:text-brand-light underline underline-offset-4"
          >
            privacy policy
          </Link>
          . We may update these terms; the terms page shows when they last
          changed.
        </p>
      </LegalSection>
    </div>
  );
}
