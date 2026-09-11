"use client";

import { Upload, X } from "lucide-react";
import { Label } from "./ui/label";
import { useCallback, useState } from "react";
import clsx from "clsx";
import { useDropzone } from "react-dropzone";
import { CldImage } from "next-cloudinary";
import Image from "next/image";

export default function ImageUpload({
  initialURL,
  setFile,
  setIsDeleted,
}: {
  initialURL: string;
  setFile: (file: File | null) => void;
  setIsDeleted?: (isDeleted: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(initialURL || null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
      }
    },
    [setFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: false,
  });


  return (
    <div className="row-span-3 flex aspect-square flex-col gap-4">
      <Label>Image</Label>

      <div
        {...getRootProps()}
        className={clsx(
          "relative h-full overflow-hidden rounded-2xl border p-2 transition-colors",
          isDragActive && "border-blue-500 bg-blue-50",
        )}
      >
        {preview ? (
          <div className="relative h-full w-full">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                setFile(null);
                if (setIsDeleted) {
                  setIsDeleted(true);
                }
              }}
              className="absolute top-2 right-2 z-10 cursor-pointer rounded-full border bg-white p-1 shadow-sm hover:bg-gray-100"
            >
              <X strokeWidth={1.25} size={20} />
            </button>

            {preview.startsWith("http") ? (
              <CldImage
                alt={"preview"}
                src={preview}
                fill
                className="rounded-lg object-cover"
              />
            ) : (
              <Image
                alt="preview"
                src={preview}
                fill
                className="rounded-lg object-cover"
              />
            )}
          </div>
        ) : (
          <div className="flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-400 p-4 text-center">
            <Upload strokeWidth={1.25} />
            <p>Click or drag to upload image</p>
            <p className="text-xs text-gray-500">
              {isDragActive ? "Drop the file here" : "PNG, JPG, GIF up to 70MB"}
            </p>
          </div>
        )}

        <input {...getInputProps()} disabled={false} />
      </div>
    </div>
  );
}
