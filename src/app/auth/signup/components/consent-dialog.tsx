"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TermsContent } from "@/components/legal/terms-content";

/**
 * The terms and informed consent students accept before registering, the same
 * text as /misc/terms.
 *
 * Accepting ticks the consent checkbox on the form; it doesn't submit the form.
 * The text scrolls in a plain overflow container: the Radix ScrollArea it used to
 * sit in had no height of its own inside the dialog's max-height, so the end of
 * the terms (and the reason to accept) was cut off with no way to scroll to it.
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
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Terms and informed consent</DialogTitle>
          <DialogDescription>
            How the site works, how counseling works, and when information may
            be shared.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border p-4 [scrollbar-width:thin] md:p-6">
          <TermsContent />
        </div>
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
