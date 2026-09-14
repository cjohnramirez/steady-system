import type { Metadata } from "next";
import { TermsContent } from "@/components/legal/terms-content";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = { title: "Terms and informed consent" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and informed consent"
      summary="What you agree to when you create an account: how to use the site, how counseling works, and when information may be shared."
    >
      <TermsContent />
    </LegalPage>
  );
}
