import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const outIndexPath = resolve(ROOT, "out/index.html");
const homepageUrl = "https://www.loanchop.com";

let html = readFileSync(outIndexPath, "utf8");
const escapedHomepageUrl = homepageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const homepageSlashPattern = new RegExp(
  `${escapedHomepageUrl}/(?=(?:\\\\)?")`,
  "g",
);
const alreadyNormalizedPattern = new RegExp(
  `${escapedHomepageUrl}(?=(?:\\\\)?")`,
  "g",
);

const didReplace = homepageSlashPattern.test(html);

if (!didReplace) {
  if (alreadyNormalizedPattern.test(html)) {
    console.log("Homepage metadata already normalized in out/index.html");
    process.exit(0);
  }
  throw new Error(`Expected to find homepage metadata URLs in ${outIndexPath}`);
}

html = html.replace(homepageSlashPattern, homepageUrl);
writeFileSync(outIndexPath, html);

console.log("Normalized homepage canonical and og:url in out/index.html");
