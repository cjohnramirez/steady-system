"use client";

import { useId, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

/**
 * Frame shared by the article, announcement and playlist editors.
 *
 * The form id is generated once and given to both the form and the submit button.
 * Every one of the six old modals pointed its Save button at a form id that did not
 * exist, so clicking Save did nothing.
 */
export function ContentDialogShell({
  title,
  description,
  isEditing,
  isBusy,
  busyLabel,
  onClose,
  onDelete,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  isEditing: boolean;
  isBusy: boolean;
  busyLabel: string;
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: () => void;
  children: (formId: string) => ReactNode;
}) {
  const formId = useId();

  return (
    <Dialog open onOpenChange={(open) => !open && !isBusy && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {children(formId)}
        </form>
        <DialogFooter className="sm:justify-between">
          {isEditing && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={onDelete}
              disabled={isBusy}
            >
              <Trash2 aria-hidden />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button type="submit" form={formId} disabled={isBusy}>
              {isBusy && <Spinner />}
              {isBusy ? busyLabel : isEditing ? "Save changes" : "Publish"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
