import { parseClientEnv } from "./schema";

/**
 * Public configuration, safe in the browser bundle.
 *
 * Each variable is read by its full literal name because Next.js only inlines
 * `process.env.NEXT_PUBLIC_*` accesses it can see statically. Passing
 * `process.env` itself would ship an empty object to the client.
 */
export const clientEnv = parseClientEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
});
