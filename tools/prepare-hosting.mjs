import { copyFile, lstat, mkdir, realpath, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Explicit public inventory. Add new assets here after reviewing them.
const publicFiles = [
  "404.html",
  "favicon.png",
  "index.html",
  "list.html",
  "manifest.json",
  "robots.txt",
  "sitemap.xml",
  "survey.html",
  "assets/common.css",
  "assets/firebase-init.js",
  "assets/guide-ui.css",
  "assets/site-footer.js",
  "assets/site-links.js",
  "kurasapo/index.html",
  "kurasapo/photo-report-image.jpg",
  "v2/app.js",
  "v2/config.js",
  "v2/content.js",
  "v2/data.js",
  "v2/index.html",
  "v2/style.css",
  "v2/univlife-logo.png",
  "v4/air-conditioner-indoor-v1.webp",
  "v4/air-filter-cleaning-floor-v2.jpg",
  "v4/air-filter-cleaning-v1.jpg",
  "v4/app.js",
  "v4/block-queries.js",
  "v4/body.js",
  "v4/cancellation-eligibility.js",
  "v4/cancellation.js",
  "v4/cleaning-image.jpg",
  "v4/config.js",
  "v4/content.js",
  "v4/data.js",
  "v4/delivery-box-illustration-v1.png",
  "v4/gas-emergency.js",
  "v4/hero-room.webp",
  "v4/home-room-warm.png",
  "v4/home-scenes-simple-v2.jpg",
  "v4/home-scenes-simple-v3.jpg",
  "v4/home-scenes.png",
  "v4/home-scenes.webp",
  "v4/home.css",
  "v4/home.js",
  "v4/index.html",
  "v4/kurasapo-inspection-v1.png",
  "v4/legacy-home.css",
  "v4/link-icons.js",
  "v4/living-visual.svg",
  "v4/moving-image.jpg",
  "v4/navigation.js",
  "v4/photo-context.js",
  "v4/property-content.js",
  "v4/property-settings.js",
  "v4/store-icons.js",
  "v4/style.css",
  "v4/theme.css",
  "v4/trash-collection.js",
  "v4/trouble.css",
  "v4/trouble.js",
  "v4/univlife-logo.png",
];

const root = await realpath(fileURLToPath(new URL("..", import.meta.url)));
const output = join(root, "hosting-public");

// Check every source before rebuilding, including parent directories.
for (const file of publicFiles) {
  const source = join(root, file);
  if (!(await lstat(source)).isFile() || await realpath(source) !== source) {
    throw new Error(`Expected a regular repository file: ${file}`);
  }
}

const existing = await lstat(output).catch(error => {
  if (error.code !== "ENOENT") throw error;
});
if (existing) {
  if (!existing.isDirectory() || await realpath(output) !== output) {
    throw new Error("Unsafe Hosting output directory");
  }
  await rm(output, { recursive: true });
}

await mkdir(output);
for (const file of publicFiles) {
  const target = join(output, file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(join(root, file), target);
}

console.log(`Prepared ${publicFiles.length} public files in hosting-public.`);
