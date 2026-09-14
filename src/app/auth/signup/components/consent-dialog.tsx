"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const TERMS = [
  "Each Counseling session will last about 45-60 minutes, but may run longer depending on the case",
  "The frequency of Counseling sessions will be at the discretion of the counselor",
  "The client will share information about his or her problems or issues with the counselor that may have affected certain areas of his or her life.",
  "The client may ask questions before, during, and after the Counseling session (s) if there are things unclear to her or him.",
  "The counselor will guide the session and may ask probing questions to better understand the specific or various concerns of the client regarding personal matters. academic, emotional, psychological, occupational, spiritual, etc.",
  "Both the client and the counselor have the right not to continue the Counseling sessions without any impediment unless required by a specific authority.",
  "In case of termination, both client and counselor have the responsibility to notify each party of the reason for dismissing the sessions for record purposes.",
  "There is no fee for Counseling services.",
  "Virtual/electronic Counseling sessions may experience privacy and other technical glitches.",
  "All information provided in this form and during Counseling will be kept strictly confidential except for reasons cited in the dimensions of confidentiality",
];

const EXEMPTIONS = [
  {
    title: "The client is a danger to self or others.",
    description:
      "The law places physical safety above considerations of confidentiality or the right of privacy. Protection of the person takes precedence and includes the duty to warn.",
  },
  {
    title: "The client requests the release of information.",
    description:
      "Privacy belongs to the client and may be waived. The counselor should release information as requested by the client.",
  },
  {
    title: "A court orders the release of information.",
    description:
      "The responsibility under the law for the counselor to maintain confidentiality is overridden when the court determines that the information is needed to serve the cause of justice.",
  },
  {
    title: "The counselor is receiving systematic clinical supervision.",
    description:
      "The client gives up the right to confidentiality when it is known that session material will be used during supervision.",
  },
  {
    title:
      "Clerical assistants process information and papers relating to the client.",
    description:
      "The client should be informed that office personnel will have access to the records for notice for routine matters such as billing and record-keeping.",
  },
  {
    title: "Legal and clinical consultations are needed.",
    description:
      "Again, the client should be informed of the (ethical) right of the counselor to obtain other professional opinions about progress and the name (s) of those used as a consultant (s).",
  },
  {
    title:
      "Clients raise the issue of their mental health in a legal proceeding.",
    description:
      "In a custody suit, for example, parents introduce their mental condition into the suit, whereupon they authorize release of the counselor's records.",
  },
  {
    title: "A third party is present in the room.",
    description:
      "Clients are (presumably) aware that a person other than the counselor is present and therefore waive their right of privacy in permitting the third person to be present.",
  },
  {
    title: "Clients are below the age of 18.",
    description:
      "Parents or guardians have the legal right to communication between the minor and the counselor.",
  },
  {
    title:
      "Intra-agency or institutional sharing of information is part of the treatment process.",
    description:
      "Otherwise, confidential material may be shared among professional staff when it is in the interest of the client to do so. However, the client must be aware that this is being done.",
  },
  {
    title: "The counselor has reason to suspect child abuse.",
    description:
      "All states now legally require the reporting of suspected abuse.",
  },
];

/**
 * The informed-consent text students must accept before registering.
 *
 * Accepting ticks the consent checkbox on the form; it no longer submits the form
 * itself. The old flow reopened this dialog after "Accept" because the submit
 * handler read the consent flag before React had updated it.
 */
export default function ConsentDialog({
  open,
  onOpenChange,
  onAccept,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Informed consent</DialogTitle>
          <DialogDescription>
            Please read how counseling works and when information may be shared.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1 rounded-xl border">
          <div className="space-y-6 p-4 md:p-6">
            <section className="space-y-1">
              <h3 className="text-base font-medium">
                The right to informed consent
              </h3>
              <p className="text-muted-foreground">
                The clients have the right to decide whether to enter into a
                counseling relationship with the specific counselor and must be
                told what to expect (Villar, 2009).
              </p>
            </section>
            <section className="space-y-1">
              <h3 className="text-base font-medium">Counseling</h3>
              <p className="text-muted-foreground">
                It is a collaborative effort between the counselor and client.
                Professional counselors help clients identify goals and
                potential solutions to problems that cause emotional turmoil;
                seek to improve communication and coping skills; strengthen
                self-esteem; and promote behavior change and optimal mental
                health (American Counseling Association, 2021).
              </p>
            </section>
            <section className="space-y-3">
              <h3 className="text-base font-medium">Terms and conditions</h3>
              <ul className="space-y-3">
                {TERMS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2
                      aria-hidden
                      strokeWidth={1.25}
                      className="mt-0.5 size-5 shrink-0"
                    />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section className="space-y-3">
              <h3 className="text-base font-medium">
                Dimensions of confidentiality
              </h3>
              <p className="text-muted-foreground">
                Clients have a right to know that the counselor may discuss
                certain details of the relationship with a supervisor or a
                colleague, and that there are times when confidential
                information must be divulged. Arthur and Swanson (1993) note
                these exemptions, cited by Bisell and Royce (1992), to the
                ethical principle of confidentiality.
              </p>
              <ul className="space-y-3">
                {EXEMPTIONS.map((item) => (
                  <li key={item.title} className="flex gap-2">
                    <CheckCircle2
                      aria-hidden
                      strokeWidth={1.25}
                      className="mt-0.5 size-5 shrink-0"
                    />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onAccept}>I have read and accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
