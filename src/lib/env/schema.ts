import { z } from "zod";

const nonEmpty = z.string().trim().min(1, "is not set");

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url("must be a URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: nonEmpty,
  // Stored without a trailing slash, since links append "/auth/callback" to it.
  NEXT_PUBLIC_APP_URL: z
    .url("must be a URL")
    .transform((url) => url.replace(/\/+$/, "")),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: nonEmpty,
});

const serverSchema = clientSchema.extend({
  SUPABASE_SERVICE_KEY: nonEmpty,
  CLOUDINARY_API_KEY: nonEmpty,
  CLOUDINARY_API_SECRET: nonEmpty,
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

type Source = Record<string, string | undefined>;

function parse<T extends z.ZodType>(schema: T, source: Source): z.infer<T> {
  const result = schema.safeParse(source);
  if (result.success) return result.data;

  const problems = result.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid environment variables:\n${problems}\nCopy .env.example to .env.local and fill them in.`,
  );
}

export const parseClientEnv = (source: Source): ClientEnv =>
  parse(clientSchema, source);

export const parseServerEnv = (source: Source): ServerEnv =>
  parse(serverSchema, source);
