/**
 * Pixel-diff visual regression for pills & badges.
 *
 * - Boots vite dev server (or reuses one at $GALLERY_URL).
 * - Visits /dev/pill-gallery at mobile / tablet / desktop viewports.
 * - Screenshots every `[data-pill-id]` anchor.
 * - Pixel-diffs against goldens in tests/visual/__screenshots__/{bp}/.
 * - Exits non-zero on any mismatch unless --update is passed.
 *
 * Usage:
 *   bun run snapshot:pixels          # verify
 *   bun run snapshot:pixels:update   # accept changes / seed goldens
 */
import { chromium, type Browser, type Page } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const SHOT_DIR = join(__dirname, "__screenshots__");
const DIFF_DIR = join(__dirname, "__diffs__");

const BREAKPOINTS = [
  { name: "mobile",  width: 375,  height: 900 },
  { name: "tablet",  width: 820,  height: 900 },
  { name: "desktop", width: 1280, height: 900 },
] as const;

const UPDATE = process.argv.includes("--update");
const THRESHOLD = 0.1;        // per-pixel color tolerance (pixelmatch)
const MAX_DIFF_PIXELS = 5;    // anti-aliasing slack per crop

// ─────────────────────────────────────────────────────────────────────────────
// Dev server boot
// ─────────────────────────────────────────────────────────────────────────────

async function ensureGallery(): Promise<{ url: string; stop: () => void }> {
  if (process.env.GALLERY_URL) {
    return { url: process.env.GALLERY_URL, stop: () => {} };
  }
  const port = 5191;
  const url = `http://localhost:${port}/dev/pill-gallery`;
  const proc: ChildProcess = spawn(
    "bunx",
    ["vite", "dev", "--port", String(port), "--strictPort", "--host", "127.0.0.1"],
    { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NODE_ENV: "development" } },
  );
  proc.stdout?.on("data", () => {});
  proc.stderr?.on("data", () => {});

  // Poll until the gallery responds.
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(url);
      if (r.ok) return { url, stop: () => proc.kill("SIGTERM") };
    } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  proc.kill("SIGTERM");
  throw new Error(`Gallery did not come up at ${url} within 60s`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Capture + diff
// ─────────────────────────────────────────────────────────────────────────────

async function captureBreakpoint(
  browser: Browser,
  url: string,
  bp: typeof BREAKPOINTS[number],
): Promise<Map<string, Buffer>> {
  const context = await browser.newContext({
    viewport: { width: bp.width, height: bp.height },
    deviceScaleFactor: 1,
    // Reduce non-determinism from animations and font loading.
    reducedMotion: "reduce",
  });
  const page: Page = await context.newPage();
  // Kill animations/transitions outright — pulse on connecting state etc.
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}`;
    document.documentElement.appendChild(style);
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts?.ready);

  const ids: string[] = await page.$$eval("[data-pill-id]", (els) =>
    (els as HTMLElement[]).map((e) => e.getAttribute("data-pill-id") || ""),
  );

  const out = new Map<string, Buffer>();
  for (const id of ids) {
    const handle = await page.$(`[data-pill-id="${CSS.escape(id)}"]`).catch(() => null);
    // Fallback for environments without CSS.escape available in node-context
    const locator = handle ?? (await page.$(`[data-pill-id="${id}"]`));
    if (!locator) continue;
    const buf = await locator.screenshot({ omitBackground: false });
    out.set(id, buf);
  }
  await context.close();
  return out;
}

function loadPng(buf: Buffer): PNG { return PNG.sync.read(buf); }

function diff(a: PNG, b: PNG): { mismatch: number; diffPng: PNG | null } {
  if (a.width !== b.width || a.height !== b.height) {
    return { mismatch: Infinity, diffPng: null };
  }
  const out = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, out.data, a.width, a.height, {
    threshold: THRESHOLD,
    includeAA: false,
  });
  return { mismatch: n, diffPng: out };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(SHOT_DIR)) mkdirSync(SHOT_DIR, { recursive: true });
  if (!existsSync(DIFF_DIR)) mkdirSync(DIFF_DIR, { recursive: true });

  const { url, stop } = await ensureGallery();
  console.log(`→ gallery ${url}`);

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/bin/chromium",
    args: ["--no-sandbox"],
  });
  const failures: string[] = [];
  let captured = 0;
  let matched = 0;
  let written = 0;

  try {
    for (const bp of BREAKPOINTS) {
      const bpDir = join(SHOT_DIR, bp.name);
      const bpDiff = join(DIFF_DIR, bp.name);
      if (!existsSync(bpDir)) mkdirSync(bpDir, { recursive: true });
      if (!existsSync(bpDiff)) mkdirSync(bpDiff, { recursive: true });

      const shots = await captureBreakpoint(browser, url, bp);
      captured += shots.size;

      for (const [id, buf] of shots) {
        const safe = id.replace(/[^a-z0-9._-]/gi, "_");
        const golden = join(bpDir, `${safe}.png`);

        if (UPDATE || !existsSync(golden)) {
          writeFileSync(golden, buf);
          written++;
          continue;
        }

        const a = loadPng(readFileSync(golden));
        const b = loadPng(buf);
        const { mismatch, diffPng } = diff(a, b);
        if (mismatch > MAX_DIFF_PIXELS) {
          const diffPath = join(bpDiff, `${safe}.diff.png`);
          const actualPath = join(bpDiff, `${safe}.actual.png`);
          writeFileSync(actualPath, buf);
          if (diffPng) writeFileSync(diffPath, PNG.sync.write(diffPng));
          failures.push(`  ${bp.name}/${id}: ${mismatch === Infinity ? "size mismatch" : `${mismatch}px differ`} → ${diffPath}`);
        } else {
          matched++;
        }
      }
    }
  } finally {
    await browser.close();
    stop();
  }

  const goldenCount = BREAKPOINTS.reduce(
    (n, bp) => n + (existsSync(join(SHOT_DIR, bp.name)) ? readdirSync(join(SHOT_DIR, bp.name)).length : 0),
    0,
  );
  console.log(`  captured ${captured}, matched ${matched}, written ${written}, goldens on disk ${goldenCount}`);

  if (failures.length) {
    console.error(`\n✗ ${failures.length} pixel-diff mismatch(es):\n${failures.join("\n")}\n\nReview the diffs, then run \`bun run snapshot:pixels:update\` to accept.`);
    process.exit(1);
  }
  console.log(UPDATE ? "✓ goldens updated" : "✓ all screenshots match");
}

main().catch((e) => { console.error(e); process.exit(1); });
