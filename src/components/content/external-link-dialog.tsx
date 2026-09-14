"use client";

import { ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** Warns before opening a link to another website in a new tab. */
export function ExternalLinkDialog({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    // Keep the raw value.
  }

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Open {title}?</AlertDialogTitle>
          <AlertDialogDescription>
            This opens{" "}
            <span className="text-foreground font-medium">{host}</span> in a new
            tab. That site isn&apos;t run by the guidance office and has its own
            policies.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay here</AlertDialogCancel>
          <AlertDialogAction asChild>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
            >
              Continue
              <ExternalLink aria-hidden />
            </a>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
