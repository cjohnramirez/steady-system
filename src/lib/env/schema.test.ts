import { describe, expect, it } from "vitest";
import { parseClientEnv, parseServerEnv } from "./schema";

const client = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo",
};

const server = {
  ...client,
  SUPABASE_SERVICE_KEY: "sb_secret_x",
  CLOUDINARY_API_KEY: "123",
  CLOUDINARY_API_SECRET: "shh",
};

describe("parseClientEnv", () => {
  it("accepts a complete environment", () => {
    expect(parseClientEnv(client).NEXT_PUBLIC_SUPABASE_URL).toBe(
      "https://abc.supabase.co",
    );
  });

  // A missing key used to surface as "supabaseKey is required" from deep inside
  // supabase-js, on every request, with no hint about which variable to set.
  it("names every missing variable and points at .env.example", () => {
    expect(() =>
      parseClientEnv({ ...client, NEXT_PUBLIC_SUPABASE_URL: "" }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL[\s\S]*\.env\.example/);
  });

  it("rejects a URL that is not a URL", () => {
    expect(() =>
      parseClientEnv({ ...client, NEXT_PUBLIC_SUPABASE_URL: "abc" }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});

describe("parseServerEnv", () => {
  it("requires the server secrets", () => {
    expect(() =>
      parseServerEnv({ ...server, SUPABASE_SERVICE_KEY: undefined }),
    ).toThrow(/SUPABASE_SERVICE_KEY/);
    expect(parseServerEnv(server).CLOUDINARY_API_SECRET).toBe("shh");
  });
});
