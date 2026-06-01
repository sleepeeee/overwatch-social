import { expect, test } from "@playwright/test";

test.describe("首頁響應式檢查", () => {
  test("主要入口與導覽在桌機與手機都可見", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /尋找心靈契合/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /使用 Google 登入|Google/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /建立遊戲名片/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /漫步玩家廣場/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "首頁" })).toBeVisible();
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
