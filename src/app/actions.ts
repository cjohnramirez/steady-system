"use server";

import { createServiceClient } from "@/utils/supabase/service";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function updateAnalytics() {
  const supabaseAdmin = await createServiceClient();
  const { error } = await supabaseAdmin.rpc("increment_daily_visitor");
  if (error) throw new Error("Error incrementing visitors: " + error.message);
}

export async function uploadToCloudinary(file: File, folder: string) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folder },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      uploadStream.end(buffer);
    });

    const getOptimizedUrl = (publicId: string, autoCrop: boolean) => {
      const baseConfig = { fetch_format: "auto", quality: "auto" };
      if (autoCrop) {
        return cloudinary.url(publicId, {
          ...baseConfig,
          crop: "auto",
          gravity: "auto",
          width: 500,
          height: 500,
        });
      }
      return cloudinary.url(publicId, baseConfig);
    };

    return {
      publicId: result.public_id,
      optimizedUrl: getOptimizedUrl(result.public_id, false),
      autoCropUrl: getOptimizedUrl(result.public_id, true),
    };
  } catch (error) {
    console.error("Upload failed in server action:", error);
    throw new Error("Upload failed");
  }
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok") {
      throw new Error("Failed to delete image from Cloudinary");
    }
    return { success: true, message: "Image deleted successfully" };
  } catch (error) {
    console.error("Delete failed in server action:", error);
    throw new Error("Delete failed");
  }
}
