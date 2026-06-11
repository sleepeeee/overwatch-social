import { expect, test } from "@playwright/test";

test.describe("首頁響應式檢查", () => {
  test("主要入口與導覽在桌機與手機都可見", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("慢速玩家展示館 運作中")).toBeVisible();
    await expect(page.getByRole("link", { name: /名片廣場與展示館/ })).toBeVisible();
    await expect(page.getByText("全域身份工作室")).toBeVisible();
    await expect(page.getByRole("link", { name: /AFTER MIDNIGHT/ })).toBeVisible();
  });

  test("手機第一屏保留主要入口", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("link", { name: /名片廣場與展示館/ })).toBeInViewport();
  });

  test("手機版沒有橫向爆版", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await page.goto("/");

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });

    expect(overflow).toBeLessThanOrEqual(1);
  });
});
