"use client";

import { useId, useRef, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Unified 3-band Figma modal shell for Create / Edit Announcement (687:1252),
 * Article (687:1282), and Playlist (687:1312).
 */
export function ContentDialogShell({
  title,
  description,
  submitLabel,
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
  submitLabel: string;
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
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[540px]">
        {/* Static Gray Header Band */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">{title}</DialogTitle>
          <DialogDescription className="text-foreground/80 mt-1 text-[15px]">
            {description}
          </DialogDescription>
        </div>

        {/* Scrollable White Center Body */}
        <form
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="divide-border min-h-0 flex-1 divide-y overflow-y-auto text-left"
        >
          {children(formId)}
        </form>

        {/* Static Gray Footer Band */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-between gap-3 border-t px-6 py-4">
          {isEditing && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isBusy}
            >
              <Trash2 strokeWidth={1.5} className="size-4" />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button type="submit" form={formId} loading={isBusy}>
              {isBusy ? busyLabel : submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Figma Cover Photo section shared across Announcement, Article, and Playlist modals:
 * Rounded-[16px] banner preview with Replace button wired to a hidden file picker.
 */
export function CoverPhotoSection({
  label,
  preview,
  onChange,
}: {
  label: string;
  preview: string | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 p-6">
      <p className="text-foreground text-[15px] font-medium">{label}</p>

      <div className="bg-primary relative h-[185px] w-full overflow-hidden rounded-[20px]">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="size-full object-cover" />
        ) : (
          <div
            aria-hidden
            className="relative size-full overflow-hidden bg-[#2b7fff]"
          >
            <div className="absolute top-[-140px] left-[58%] flex size-[345px] items-center justify-center">
              <div className="flex-none rotate-[-24.73deg]">
                <div className="relative size-[260px]">
                  <div className="absolute inset-[-6.56%_0_0_-14.24%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src="/images/cover-orb-top.svg"
                      className="block size-full max-w-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-[-23px] left-[-153px] flex size-[345px] items-center justify-center">
              <div className="flex-none rotate-[155.27deg]">
                <div className="relative size-[260px]">
                  <div className="absolute inset-[-6.56%_0_0_-14.24%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src="/images/cover-orb-bottom.svg"
                      className="block size-full max-w-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (file) onChange(file);
        }}
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <Pencil strokeWidth={1.5} className="size-4" />
          {preview ? "Replace" : "Upload Photo"}
        </Button>
      </div>
    </div>
  );
}
