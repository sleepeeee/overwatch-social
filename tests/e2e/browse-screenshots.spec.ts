import { test } from "@playwright/test";

test.describe("卡片廣場視覺截圖驗證", () => {
  test("Desktop 截圖 1280x800", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("http://127.0.0.1:3000/browse");
    // 等待 Loading 消失，且卡片渲染完成
    await page.waitForSelector(".floating-paper-card", { timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "reports/browse-desktop.png", fullPage: false });
  });

  test("Mobile 截圖 375x812", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("http://127.0.0.1:3000/browse");
    // 等待 Loading 消失，且卡片渲染完成
    await page.waitForSelector(".floating-paper-card", { timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "reports/browse-mobile.png", fullPage: false });
  });
});
