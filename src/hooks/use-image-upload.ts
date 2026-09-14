"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteImage,
  signUpload,
  type UploadTarget,
} from "@/lib/uploads/actions";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * The picture half of a content form.
 *
 * `prepare()` uploads a newly chosen file straight to Cloudinary and returns the URL
 * to save. `commit()` runs only after the record has saved and removes the image it
 * replaced. The old hook deleted the previous image before saving, so a failed save
 * left the record pointing at a file that no longer existed.
 */
export function useImageUpload(target: UploadTarget, initialUrl: string) {
  const [file, setFile] = useState<File | null>(null);
  const [removed, setRemoved] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  // Blob previews hold the whole file in memory until revoked.
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const choose = useCallback((next: File | null) => {
    setFile(next);
    setRemoved(next === null);
    setPreview(next ? URL.createObjectURL(next) : null);
  }, []);

  async function prepare(): Promise<string> {
    if (!file) return removed ? "" : initialUrl;

    setIsUploading(true);
    try {
      const signed = await signUpload(target);
      if (!signed.ok) throw new Error(signed.error);

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", signed.data.apiKey);
      body.append("timestamp", String(signed.data.timestamp));
      body.append("signature", signed.data.signature);
      body.append("folder", signed.data.folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.data.cloudName}/image/upload`,
        { method: "POST", body },
      );
      const json = (await response.json()) as {
        secure_url?: string;
        error?: { message: string };
      };
      if (!response.ok || !json.secure_url) {
        throw new Error(
          json.error?.message ?? "The image could not be uploaded.",
        );
      }
      return json.secure_url;
    } finally {
      setIsUploading(false);
    }
  }

  /** After a successful save: remove the image the record used to point at. */
  async function commit(savedUrl: string) {
    if (initialUrl && initialUrl !== savedUrl) {
      const result = await deleteImage(initialUrl);
      if (!result.ok) console.warn("Old image was not removed:", result.error);
    }
  }

  return { file, preview, choose, prepare, commit, isUploading };
}
