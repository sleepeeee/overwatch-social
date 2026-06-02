import { expect, test } from "@playwright/test";

// browse 頁也有 authLoading spinner，需等待其消失
async function waitForBrowseReady(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => !document.querySelector(".animate-spin"),
    { timeout: 15000 }
  ).catch(() => {});
}

test.describe("名片廣場功能", () => {
  test("廣場頁面有三個遊戲 Tab", async ({ page }) => {
    await page.goto("/browse");
    await waitForBrowseReady(page);
    // 使用 role=button 精確定位 Tab 按鈕（避免 strict mode violation）
    await expect(page.getByRole("button", { name: /Overwatch/ })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole("button", { name: /Valorant/ })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /LoL/ })).toBeVisible({ timeout: 5000 });
  });

  test("搜尋欄可以輸入文字", async ({ page }) => {
    await page.goto("/browse");
    await waitForBrowseReady(page);
    const searchInput = page.getByPlaceholder(/搜尋玩家/i);
    await expect(searchInput).toBeVisible({ timeout: 8000 });
    await searchInput.fill("安娜");
    await expect(searchInput).toHaveValue("安娜");
  });

  test("廣場篩選區在 hydration 後顯示（不用 waitForTimeout）", async ({ page }) => {
    await page.goto("/browse");
    // 等待 Overwatch tab 按鈕出現（代表 JS hydrated + 元件渲染）
    await expect(page.getByRole("button", { name: /Overwatch/ })).toBeVisible({ timeout: 10000 });
  });

  test("TopBar 在廣場顯示 Google 登入按鈕（未登入）", async ({ page }) => {
    await page.goto("/browse");
    await waitForBrowseReady(page);
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible({ timeout: 8000 });
  });

  test("廣場頁面標題正確", async ({ page }) => {
    await page.goto("/browse");
    await expect(page).toHaveTitle(/OW Social/);
  });

  test("手機版廣場無橫向爆版", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await page.goto("/browse");
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
