import { Clock2, Mail } from "lucide-react";
import Image from "next/image";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  email: string;
  image: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Gerlie Campion",
    role: "Technical Writer and Documentation Specialist",
    email: "campiongerlie18@gmail.com",
    image: "",
  },
  {
    id: 2,
    name: "Francis Adrian Esteban",
    role: "Quality Assurance (QA) and Tester",
    email: "francisadrian.esteban@1.ustp.edu.ph",
    image: "",
  },
  {
    id: 3,
    name: "Jhey Gulde",
    role: "Backend Developer and System Architect",
    email: "gulde.jhey8@gmail.com",
    image: "",
  },
  {
    id: 4,
    name: "Kathleen Grace Gultiano",
    role: "UI/UX Designer",
    email: "gultiano.kathleengrace@gmail.com",
    image: "",
  },
  {
    id: 5,
    name: "John Carl Ramirez",
    role: "Project Manager and Full-Stack Developer",
    email: "johncarl.ramirez.dev@gmail.com",
    image: "",
  },
  {
    id: 6,
    name: "Renchille Pateño",
    role: "Support and Maintenance Team Lead",
    email: "pateno.renchille2002@gmail.com",
    image: "",
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="my-10 w-full rounded-4xl border bg-white">
      <section className="flex items-center justify-between border-b">
        <div className="space-y-2 p-10">
          <p className="text-6xl">Privacy Policy</p>
          <p className="w-4/5">
            This Privacy Policy explains how we collect, use, and protect your
            information when you use our website. By accessing or using the
            site, you agree to the practices described here.
          </p>
        </div>
        <div className="relative mr-10 h-25 w-40">
          <Image
            src="/codebridge-icon.png"
            alt="placeholder"
            fill
            className="rounded-4xl object-cover p-4"
          />
        </div>
      </section>
      <section className="space-y-4 p-10">
        <p>
          We collect information that you voluntarily provide when interacting
          with our website, such as through contact forms, account settings,
          email notifications (“Notify Me”), or event sign-ups. This may include
          your name, email address, contact information, and any messages or
          details you submit. In addition, we may automatically collect certain
          information about your device and usage, including your device type,
          browser type, IP address, pages visited, and general usage patterns,
          which help us maintain security and improve the site&apos;s
          functionality.
        </p>
        <p>
          Our website may also integrate with third-party services such as
          Google Calendar (for event reminders), Vercel (hosting and logs),
          Supabase (database and authentication), and email providers (e.g.,
          Mailgun or Resend). These services may collect basic usage data when
          you interact with them. We use the information we collect to provide
          and maintain site functionality, send notifications you have
          subscribed to, improve your experience, maintain security, and respond
          to support requests. We do not sell, trade, or rent your personal
          information.
        </p>
        <p>
          Our site may use cookies or similar technologies to maintain sessions,
          improve performance, and analyze traffic, though you may choose to
          disable cookies in your browser. We take appropriate steps to protect
          your personal information, including using secure connections (HTTPS),
          implementing access controls, and limiting data collection to what is
          necessary for the service. However, no system is fully secure, and we
          cannot guarantee absolute security.
        </p>
        <p>
          We only share your information with service providers necessary for
          website operations, analytics tools, or email/calendar integrations,
          and only when you opt in. Your personal information will never be
          shared for marketing purposes. Our website is intended for general
          audiences and does not knowingly collect information from children
          under 13. If any personal information from children is collected,
          please contact us so that it can be removed.
        </p>
        <p>
          Our website may contain links to external sites, and we are not
          responsible for their content, privacy practices, or any information
          you provide to them. We recommend reviewing their policies before
          interacting with these external sites.
        </p>
        <p>
          You have the right to request updates or corrections to your
          information, delete your personal data or account, and unsubscribe
          from email notifications. Please contact us to exercise these rights.
        </p>
        <p>
          We may update this Privacy Policy from time to time, and any changes
          will be posted on this page with a revised “Last Updated” date.
        </p>
        <p>
          For any questions about this Privacy Policy, you may contact us at
        </p>
        <div className="flex gap-4">
          <a
            className="flex w-fit items-center gap-4 rounded-3xl border px-4 py-2"
            href="mailto:codebridge.llc@gmail.com"
          >
            <Mail strokeWidth={1.25} />
            <p>codebridge.llc@gmail.com</p>
          </a>
          <div className="flex w-fit items-center gap-4 rounded-3xl border px-4 py-2">
            <Clock2 strokeWidth={1.25} />
            <p>Last Updated on November 27, 2025</p>
          </div>
        </div>
      </section>
    </main>
  );
}
