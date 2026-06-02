import { expect, test } from "@playwright/test";

// 注意：/player/[id] 是 Server Component，無法用 page.route() mock server-side Supabase 查詢。
// 以下測試只針對「不存在玩家」的 not-found 行為（不依賴 production DB）。
// 「存在玩家」的完整測試需要 Supabase local emulator 或 dedicated test data，留待 Change D。

const NON_EXISTENT_UUID = "00000000-0000-0000-0000-000000000000";

test.describe("玩家詳細頁 — Not Found 行為", () => {
  test("不存在的 UUID 顯示 not found 訊息", async ({ page }) => {
    await page.goto(`/player/${NON_EXISTENT_UUID}`);
    await expect(page.getByText(/不存在或已將名片設為私密/)).toBeVisible({ timeout: 10000 });
  });

  test("not found 頁有返回廣場連結", async ({ page }) => {
    await page.goto(`/player/${NON_EXISTENT_UUID}`);
    await expect(page.getByText(/返回廣場/)).toBeVisible({ timeout: 10000 });
  });

  test("not found 頁可點返回廣場到 /browse", async ({ page }) => {
    await page.goto(`/player/${NON_EXISTENT_UUID}`);
    await page.getByText(/返回廣場/).click();
    await expect(page).toHaveURL("/browse");
  });

  test("玩家詳細頁有 OW Social 標題", async ({ page }) => {
    await page.goto(`/player/${NON_EXISTENT_UUID}`);
    await expect(page).toHaveTitle(/OW Social/);
  });
});
