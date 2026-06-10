import { expect, test } from "@playwright/test";

// browse 頁也有 authLoading spinner，需等待其消失
async function waitForBrowseReady(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    () => !document.querySelector(".animate-spin"),
    { timeout: 15000 }
  ).catch(() => {});
}

test.describe("名片廣場功能", () => {
  test("廣場頁面有遊戲選擇器", async ({ page }) => {
    await page.goto("/browse");
    await waitForBrowseReady(page);
    const gameSelect = page.getByRole("combobox").first();
    await expect(gameSelect).toBeVisible({ timeout: 8000 });
    await expect(gameSelect).toHaveValue("ow");
  });

  test("搜尋欄可以輸入文字", async ({ page }) => {
    await page.goto("/browse");
    await waitForBrowseReady(page);
    const searchInput = page.getByPlaceholder(/搜尋名稱/i);
    await expect(searchInput).toBeVisible({ timeout: 8000 });
    await searchInput.fill("安娜");
    await expect(searchInput).toHaveValue("安娜");
  });

  test("廣場篩選區在 hydration 後顯示（不用 waitForTimeout）", async ({ page }) => {
    await page.goto("/browse");
    await expect(page.getByText(/調整探索頻率/)).toBeVisible({ timeout: 10000 });
  });

  test("廣場頁面標題正確", async ({ page }) => {
    await page.goto("/browse");
    await expect(page).toHaveTitle(/After Midnight/);
  });

  test("手機第一屏保留搜尋與遊戲選擇", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/browse");
    await waitForBrowseReady(page);

    await expect(page.getByRole("combobox").first()).toBeInViewport();
    await expect(page.getByPlaceholder(/搜尋名稱/i)).toBeInViewport();
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
