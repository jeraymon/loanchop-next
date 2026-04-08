/**
 * Generates public/sitemap.xml from calculator-catalog.ts + static pages.
 * Run via: node scripts/generate-sitemap.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITE = "https://www.loanchop.com";
const lastmod = new Date().toISOString().split("T")[0];

// Parse live calculator hrefs from calculator-catalog.ts
const catalogSrc = readFileSync(
  resolve(ROOT, "src/app/calculator-catalog.ts"),
  "utf-8"
);
const liveMatches = [...catalogSrc.matchAll(/live\(\s*"[^"]+"\s*,\s*"([^"]+)"\s*\)/g)];
const liveHrefs = liveMatches.map((m) => m[1]);

// Static pages
const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/terms/", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy/", changefreq: "yearly", priority: "0.3" },
  { path: "/accessibility/", changefreq: "yearly", priority: "0.3" },
];

// Build URL entries
const entries = [
  ...staticPages.map(
    (p) =>
      `  <url>\n    <loc>${SITE}${p.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
  ),
  ...liveHrefs.map(
    (href) =>
      `  <url>\n    <loc>${SITE}${href.endsWith("/") ? href : href + "/"}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

writeFileSync(resolve(ROOT, "public/sitemap.xml"), xml);
console.log(`sitemap.xml generated with ${staticPages.length + liveHrefs.length} URLs`);
