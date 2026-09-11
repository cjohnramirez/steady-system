"use server";

import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Counts one visit.
 *
 * Anonymous visitors are the point, so there is no auth check here. There is also
 * no service-role key: `increment_daily_visitor` is a security-definer function
 * with execute granted to anon, so a page counter no longer needs a credential that
 * can read every row in the database.
 */
export async function updateAnalytics() {
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_daily_visitor");

  if (error) {
    // A missed page view is not worth breaking a page render over.
    console.warn("Visitor analytics update failed:", error.message);
  }
}

type UploadResult = {
  publicId: string;
  optimizedUrl: string;
  autoCropUrl: string;
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Uploads an image and returns both a plain optimized URL and a square cropped one.
 *
 * Requires a signed-in caller. Without that this is an open upload endpoint against
 * a metered Cloudinary account.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<UploadResult> {
  await requireUser();

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Images must be 5 MB or smaller.");
  }

  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP and GIF images can be uploaded.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, uploaded) => {
        if (error || !uploaded) {
          reject(error ?? new Error("Cloudinary returned no result"));
          return;
        }
        resolve(uploaded);
      },
    );
    stream.end(buffer);
  });

  const base = { fetch_format: "auto", quality: "auto" };

  return {
    publicId: result.public_id,
    optimizedUrl: cloudinary.url(result.public_id, base),
    autoCropUrl: cloudinary.url(result.public_id, {
      ...base,
      crop: "auto",
      gravity: "auto",
      width: 500,
      height: 500,
    }),
  };
}

export async function deleteFromCloudinary(publicId: string) {
  await requireUser();

  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== "ok") {
    throw new Error("Failed to delete the image.");
  }

  return { success: true, message: "Image deleted successfully" };
}
