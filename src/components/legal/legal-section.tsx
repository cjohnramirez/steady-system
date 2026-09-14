import type { ReactNode } from "react";

/** A titled block of legal text. Paragraphs and lists inside take the full width. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-b py-6 leading-relaxed first:pt-0 last:border-b-0 last:pb-0">
      <h2 className="text-lg font-medium">{title}</h2>
      {children}
    </section>
  );
}
