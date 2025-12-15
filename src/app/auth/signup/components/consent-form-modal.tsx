"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AnnouncementModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAccept: () => void;
}

export default function ConsentFormModal({
  open,
  setOpen,
  onAccept,
}: AnnouncementModalProps) {
  const [checkbox, setCheckbox] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[800px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Consent Form Modal</DialogTitle>
        </DialogHeader>
        <div className="flex h-[calc(100dvh-200px)] flex-col gap-4">
          <div className="flex items-center gap-4 rounded-2xl border p-4">
            <Info strokeWidth={1.25} />
            <div>
              <p className="font-medium">
                We require your explicit consent to proceed with our services.
              </p>
              <p>Please review and accept our terms to continue.</p>
            </div>
          </div>
          <div className="flex h-[calc(100dvh-250px)] flex-col gap-4 overflow-y-scroll rounded-2xl border p-4">
            <div>
              <p className="text-xl font-medium">
                The Right to Informed Consent
              </p>
              <p>
                The clients have the right to decide whether to enter into a
                Counseling relationship with the specific counselor and must be
                told what to expect (Villar, 2009).
              </p>
            </div>
            <div>
              <p className="font-medium">Counseling</p>
              <p>
                It is a collaborative effort between the counselor and client.
                Professional counselors help clients identify goals and
                potential solutions to problems that cause emotional turmoil;
                seek to improve communication and coping skills; strengthen
                self-esteem; and promote behavior change and optimal mental
                health (American Counseling Association, 2021).
              </p>
            </div>
            <div>
              <p className="pb-3 font-medium">Terms and Conditions</p>
              <ul className="flex flex-col gap-3">
                {[
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
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2
                      strokeWidth={1.25}
                      size={20}
                      className="mt-0.5 shrink-0"
                    />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xl font-medium">
                Dimensions of Confidentiality
              </p>
              <p>
                The clients have a right to know that the counselor may be
                discussing certain details of the relationship with a supervisor
                or a colleague. Moreover. There are times when confidential
                information must be divulged, and there are exemptions. Arthur
                and Swanson (1993) note exemptions cited by Bisell and Royce
                (1992) to the ethical principle of confidentiality
              </p>
            </div>
            <div>
              <p>
                Arthur and Swanson (1993) note exemptions cited by Bisell and
                Royce (1992) to the ethical principle of confidentiality.
              </p>
            </div>
            <div>
              <p className="pb-3 font-medium">Exemptions to Confidentiality</p>
              <ul className="flex flex-col gap-3">
                {[
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
                    title:
                      "The counselor is receiving systematic clinical supervision.",
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
                ].map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <CheckCircle2
                      strokeWidth={1.25}
                      size={20}
                      className="mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <DialogFooter className="flex w-full justify-between">
          <div className="flex w-full items-center gap-2">
            <Checkbox
              id="consent-checkbox"
              checked={checkbox}
              onCheckedChange={(checked) => {
                setCheckbox(checked as boolean);
              }}
            />
            <div>
              <Label htmlFor="consent-checkbox">
                You have read and understand the terms and conditions.
              </Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              onClick={() => {
                if (checkbox) {
                  onAccept();
                }
              }}
              disabled={!checkbox}
            >
              <p>Accept</p>
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
