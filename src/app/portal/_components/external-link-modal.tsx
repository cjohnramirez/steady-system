"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";

interface ExternalLinkModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  url: string;
}

export default function ExternalLinkModal({
  open,
  setOpen,
  url,
}: ExternalLinkModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[500px]"
        showCloseButton={false}
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Leaving Site</DialogTitle>
        </DialogHeader>
        <div>
          You are about to open a link to a website outside of our platform. It
          may have different content and policies, but we want to make sure you
          know before you go. Would you like to continue?
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button asChild disabled={!url}>
            {url ? (
              <Link href={url} target="_blank" rel="noopener noreferrer">
                Continue
              </Link>
            ) : (
              <span>Continue to External Link</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
