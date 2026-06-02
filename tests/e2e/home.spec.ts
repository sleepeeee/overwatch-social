import { expect, test } from "@playwright/test";

test.describe("首頁核心功能", () => {
  test("首頁有主標語（最佳遊戲搭檔）", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /尋找心靈契合/ })).toBeVisible();
  });

  test("TopBar 有 Logo 文字", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/After Midnight/i)).toBeVisible();
  });

  test("TopBar 在未登入時顯示 Google 登入按鈕", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
  });

  test("有建立遊戲名片按鈕（連結到 /profile）", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /建立遊戲名片/ })).toBeVisible();
  });

  test("有漫步玩家廣場按鈕（連結到 /browse）", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /漫步玩家廣場/ })).toBeVisible();
  });

  test("點漫步玩家廣場可跳到 /browse", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /漫步玩家廣場/ }).click();
    await expect(page).toHaveURL("/browse");
  });

  test("手機版首頁無橫向爆版", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await page.goto("/");
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
