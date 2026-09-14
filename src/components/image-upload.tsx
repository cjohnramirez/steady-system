"use client";

import { useId } from "react";
import Image from "next/image";
import { useDropzone, type FileRejection } from "react-dropzone";
import { ImageUp, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MAX_IMAGE_BYTES } from "@/hooks/use-image-upload";
import { cn } from "@/lib/utils";

/**
 * Choose, preview or remove one image. Uploading happens on save, through
 * useImageUpload.
 */
export default function ImageUpload({
  preview,
  onChange,
  label = "Image",
  className,
}: {
  preview: string | null;
  onChange: (file: File | null) => void;
  label?: string;
  className?: string;
}) {
  const labelId = useId();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    },
    maxSize: MAX_IMAGE_BYTES,
    multiple: false,
    onDropAccepted: ([file]) => onChange(file),
    onDropRejected: ([rejection]: FileRejection[]) => {
      const tooBig = rejection?.errors.some((e) => e.code === "file-too-large");
      toast.error(
        tooBig
          ? "Images must be 5 MB or smaller."
          : "Use a JPG, PNG, WebP or GIF image.",
      );
    },
  });

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span id={labelId} className="text-sm font-medium">
        {label}
      </span>
      <div
        {...getRootProps({ "aria-labelledby": labelId })}
        className={cn(
          "bg-muted/40 focus-visible:ring-ring/50 relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed outline-none focus-visible:ring-[3px]",
          isDragActive && "border-primary bg-brand-subtle",
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <>
            <Image
              src={preview}
              alt=""
              fill
              sizes="(min-width: 640px) 320px, 100vw"
              className="object-cover"
              unoptimized={preview.startsWith("blob:")}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="absolute top-2 right-2"
              aria-label="Remove image"
              onClick={(event) => {
                event.stopPropagation();
                onChange(null);
              }}
            >
              <X />
            </Button>
          </>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-2 p-4 text-center">
            <ImageUp aria-hidden strokeWidth={1.25} className="size-8" />
            <p>
              {isDragActive
                ? "Drop the image here"
                : "Click or drag an image here"}
            </p>
            <p className="text-xs">JPG, PNG, WebP or GIF, up to 5 MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
