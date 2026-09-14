"use server";

import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { serverEnv } from "@/lib/env/server";
import { requireRole, requireUser } from "@/lib/auth/session";
import { fail, ok, toErrorMessage, type Result } from "@/lib/result";
import { extractPublicId } from "@/lib/format";

cloudinary.config({
  cloud_name: serverEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: serverEnv.CLOUDINARY_API_KEY,
  api_secret: serverEnv.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Where each kind of upload goes. Clients pick a key, never a raw folder name. */
const FOLDERS = {
  announcements: "gcs/announcements",
  articles: "gcs/articles",
  playlists: "gcs/playlists",
  avatars: "gcs/avatars",
} as const;

export type UploadTarget = keyof typeof FOLDERS;

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

/**
 * Signs a direct browser-to-Cloudinary upload.
 *
 * Files used to travel through a server action, whose default 1 MB body limit
 * rejected most photos while the form promised 5 MB, and any signed-in user could
 * upload into any folder. Now only admins may sign content uploads, the folder is
 * fixed server-side, and the file never touches this server.
 */
export async function signUpload(
  target: UploadTarget,
): Promise<Result<UploadSignature>> {
  try {
    const parsed = z
      .enum(Object.keys(FOLDERS) as [UploadTarget, ...UploadTarget[]])
      .safeParse(target);
    if (!parsed.success) return fail("That upload isn't allowed.");

    if (parsed.data === "avatars") await requireUser();
    else await requireRole("admin");

    const folder = FOLDERS[parsed.data];
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      serverEnv.CLOUDINARY_API_SECRET,
    );

    return ok({
      cloudName: serverEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: serverEnv.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
    });
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/**
 * Deletes an image that a saved record no longer points at. Admin only, and only
 * inside the app's own `gcs/` folders: the shared seed photos under `gcs-seed/`
 * are used by many rows and must survive any one of them being edited.
 */
export async function deleteImage(url: string): Promise<Result> {
  try {
    await requireRole("admin");
    const publicId = extractPublicId(url);
    if (!publicId || !publicId.startsWith("gcs/")) return ok();

    const result = await cloudinary.uploader.destroy(
      publicId.replace(/\.[a-z0-9]+$/i, ""),
    );
    if (result.result !== "ok" && result.result !== "not found") {
      return fail("The old image could not be removed.");
    }
    return ok();
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}
