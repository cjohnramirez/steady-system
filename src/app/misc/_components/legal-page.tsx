import type { ReactNode } from "react";
import { Clock, Mail } from "lucide-react";
import { CodeBridgeLogo } from "@/components/app/codebridge-logo";
import { LEGAL_CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/legal";

/**
 * Frame for the privacy policy and terms: title and summary beside the CodeBridge
 * logo, then the text at the full width of the card, then the contact footer.
 */
export function LegalPage({
  title,
  summary,
  children,
}: {
  title: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="bg-card w-full overflow-hidden rounded-3xl border md:rounded-4xl">
      <header className="flex flex-col-reverse gap-6 border-b p-6 sm:flex-row sm:items-center sm:justify-between md:p-10">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-4xl tracking-tight md:text-5xl">{title}</h1>
          <p className="text-muted-foreground">{summary}</p>
        </div>
        <CodeBridgeLogo className="shrink-0" />
      </header>
      <div className="w-full p-6 md:p-10">{children}</div>
      <footer className="flex flex-wrap items-center gap-3 border-t p-6 md:px-10">
        <a
          className="hover:bg-muted flex items-center gap-2 rounded-full border px-4 py-2"
          href={`mailto:${LEGAL_CONTACT_EMAIL}`}
        >
          <Mail aria-hidden strokeWidth={1.5} className="size-4" />
          {LEGAL_CONTACT_EMAIL}
        </a>
        <p className="text-muted-foreground flex items-center gap-2 rounded-full border px-4 py-2">
          <Clock aria-hidden strokeWidth={1.5} className="size-4" />
          Last updated {LEGAL_UPDATED}
        </p>
      </footer>
    </article>
  );
}
