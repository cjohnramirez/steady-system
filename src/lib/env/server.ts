import "server-only";
import { parseServerEnv } from "./schema";

/** Server secrets. Importing this from a client component fails the build. */
export const serverEnv = parseServerEnv(process.env);
