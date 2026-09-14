// Downloads placeholder photos for the demo seed.
//
// Photos come from picsum.photos, which serves images from Unsplash under the
// Unsplash License (free to use, no attribution required). Fixed ids keep the set
// reproducible. Run: node scripts/seed/download-images.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, "images");

// Picked for calm, outdoor, study and people-at-a-distance scenes.
const SETS = {
  announcements: [
    1, 20, 26, 42, 48, 60, 68, 76, 91, 103, 119, 129, 164, 180, 188, 201,
  ],
  articles: [2, 3, 6, 9, 24, 28, 29, 36, 39, 47, 57, 64, 82, 96, 110, 142],
  playlists: [10, 11, 13, 14, 15, 16, 17, 18, 19, 22, 25, 27],
};

const credits = [
  "# Seed image credits",
  "",
  "Source: https://picsum.photos (Unsplash License).",
  "",
];

for (const [folder, ids] of Object.entries(SETS)) {
  await mkdir(path.join(out, folder), { recursive: true });
  credits.push(`## ${folder}`, "");

  for (const [index, id] of ids.entries()) {
    const name = `${folder.slice(0, -1)}-${String(index + 1).padStart(2, "0")}.jpg`;
    const file = path.join(out, folder, name);
    const url = `https://picsum.photos/id/${id}/1200/800.jpg`;
    credits.push(`- ${name}: ${url} (https://picsum.photos/id/${id}/info)`);

    if (existsSync(file)) continue;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} returned ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(`saved ${folder}/${name}`);
  }
  credits.push("");
}

await writeFile(path.join(root, "CREDITS.md"), credits.join("\n"));
console.log("done");
