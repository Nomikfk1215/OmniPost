/**
 * Prepares the project for static export.
 *
 * Static export (GitHub Pages, etc.) only includes the landing page
 * and documentation — server-dependent app pages are excluded.
 *
 * Usage:
 *   node scripts/prepare-static.mjs hide    — exclude server pages
 *   node scripts/prepare-static.mjs restore — restore them
 */

import { cpSync, rmSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const appDir = join(root, "src", "app");
const backupDir = join(root, "._static_backup");

// Pages/directories that depend on server-side code and can't be statically exported.
// These are temporarily moved away during static build.
const excludeDirs = ["api", "mock", "workspace", "settings", "records", "accounts"];

const action = process.argv[2] || "hide";

if (action === "hide") {
  // Create backup directory
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });

  for (const dir of excludeDirs) {
    const src = join(appDir, dir);
    const dst = join(backupDir, dir);
    if (existsSync(src)) {
      cpSync(src, dst, { recursive: true });
      rmSync(src, { recursive: true, force: true });
      console.log(`  ✓ Excluded: src/app/${dir}`);
    }
  }
  console.log("✓ Ready for static export");
} else if (action === "restore") {
  for (const dir of excludeDirs) {
    const src = join(backupDir, dir);
    const dst = join(appDir, dir);
    if (existsSync(src)) {
      cpSync(src, dst, { recursive: true });
      rmSync(src, { recursive: true, force: true });
      console.log(`  ✓ Restored: src/app/${dir}`);
    }
  }
  // Clean up backup directory
  if (existsSync(backupDir)) {
    rmSync(backupDir, { recursive: true, force: true });
  }
  console.log("✓ Restored all pages");
} else {
  console.error('Usage: node scripts/prepare-static.mjs [hide|restore]');
  process.exit(1);
}
