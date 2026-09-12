"use client";

import { useState } from "react";
import { uploadToCloudinary, deleteFromCloudinary } from "@/app/actions";
import { extractPublicId } from "@/lib/format";

/**
 * The picture half of a content form.
 *
 * All six landing-page modals carried their own copy of this, and the copies had
 * collected problems worth naming, since this hook fixes them:
 *
 * Deleting the old image was treated as fatal. If Cloudinary refused the delete,
 * the whole save was abandoned and the user's text edits were lost, to avoid
 * leaving one orphaned file behind. That trade is backwards, so a failed cleanup
 * is now logged and the save continues.
 *
 * Replacing an image never removed the one it replaced, so every edit leaked a
 * file. Only an explicit removal cleaned up.
 *
 * The submit button was disabled on the mutation but not on the upload, so it
 * stayed clickable for the whole time the image was in flight.
 */
export function useImageUpload(folder: string) {
  const [file, setFile] = useState<File | null>(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  /**
   * Works out the image URL to save.
   *
   * Throws with a message suitable for a toast if the upload itself fails, since
   * saving a record that points at no image is not what the user asked for.
   */
  async function resolveImageUrl(currentUrl: string): Promise<string> {
    if (!file && !isRemoved) return currentUrl;

    setIsBusy(true);
    try {
      if (file) {
        const result = await uploadToCloudinary(file, folder);
        await removeQuietly(currentUrl);
        return result.optimizedUrl;
      }

      await removeQuietly(currentUrl);
      return "";
    } catch (error) {
      throw new Error(
        error instanceof Error && error.message
          ? error.message
          : "Could not upload the image.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setIsRemoved(false);
  }

  return {
    file,
    setFile,
    isRemoved,
    setIsRemoved,
    /** True while an image is being uploaded or removed. */
    isBusy,
    resolveImageUrl,
    reset,
  };
}

/**
 * Best-effort cleanup of a replaced or removed image.
 *
 * A leftover file in Cloudinary costs a little storage. Losing the user's edit
 * costs them their work, so this never throws.
 */
async function removeQuietly(url: string): Promise<void> {
  if (!url) return;

  const publicId = extractPublicId(url);
  if (!publicId) return;

  try {
    await deleteFromCloudinary(publicId);
  } catch (error) {
    console.warn("Could not remove the previous image:", error);
  }
}
