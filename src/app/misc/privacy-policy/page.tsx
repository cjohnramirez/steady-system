import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Privacy policy | GCS" };

export default function PrivacyPolicy() {
  return (
    <article className="bg-card w-full overflow-hidden rounded-3xl border md:rounded-4xl">
      <header className="flex flex-col-reverse gap-6 border-b p-6 sm:flex-row sm:items-center sm:justify-between md:p-10">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-4xl tracking-tight md:text-5xl">
            Privacy policy
          </h1>
          <p className="text-muted-foreground">
            How we collect, use and protect your information when you use this
            website. By using the site, you agree to the practices described
            here.
          </p>
        </div>
        <Image
          src="/codebridge-icon.png"
          alt="CodeBridge"
          width={120}
          height={75}
          className="h-auto w-24 object-contain"
        />
      </header>
      <div className="max-w-3xl space-y-4 p-6 leading-relaxed md:p-10">
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
        <p>For any questions about this privacy policy, contact us:</p>
        <div className="flex flex-wrap gap-3">
          <a
            className="hover:bg-muted flex items-center gap-2 rounded-full border px-4 py-2"
            href="mailto:codebridge.llc@gmail.com"
          >
            <Mail aria-hidden strokeWidth={1.5} className="size-4" />
            codebridge.llc@gmail.com
          </a>
          <p className="text-muted-foreground flex items-center gap-2 rounded-full border px-4 py-2">
            <Clock aria-hidden strokeWidth={1.5} className="size-4" />
            Last updated November 27, 2025
          </p>
        </div>
      </div>
    </article>
  );
}
