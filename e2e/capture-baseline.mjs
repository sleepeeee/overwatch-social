// 基準截圖擷取（add-standalone-theme-style Phase 0.1 / 1.4 視覺回歸用）
// 用法：node e2e/capture-baseline.mjs [輸出子目錄名，預設 baseline]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const outDir = `e2e/${process.argv[2] ?? "baseline"}`;
mkdirSync(outDir, { recursive: true });

const BASE = "http://localhost:3000";
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();
const t0 = Date.now();

// 先從廣場抓一個玩家詳細頁連結
const probe = await browser.newPage();
await probe.goto(`${BASE}/browse`, { waitUntil: "networkidle" });
const playerHref = await probe
  .locator('a[href^="/player/"]')
  .first()
  .getAttribute("href", { timeout: 5000 })
  .catch(() => null);
await probe.close();

const pages = [
  { name: "home", path: "/" },
  { name: "browse", path: "/browse" },
  { name: "profile", path: "/profile" },
  ...(playerHref ? [{ name: "player", path: playerHref }] : []),
];
if (!playerHref) console.warn("WARN: /browse 找不到玩家連結，略過 player 頁");

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: "reduce", // 凍結動畫，降低截圖不確定性
  });
  for (const p of pages) {
    const page = await ctx.newPage();
    await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500); // 等粒子背景/字體穩定
    await page.screenshot({
      path: `${outDir}/${p.name}-${vp.name}.png`,
      fullPage: true,
    });
    console.log(`OK ${p.name}-${vp.name}.png`);
    await page.close();
  }
  await ctx.close();
}

await browser.close();
console.log(`完成，輸出於 ${outDir}/，耗時 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
