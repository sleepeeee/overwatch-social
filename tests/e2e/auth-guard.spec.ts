import { expect, test } from "@playwright/test";

test.describe("Auth 守門行為", () => {
  test("/profile 有 TopBar 和 Google 登入按鈕（未登入）", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText(/After Midnight/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible({ timeout: 8000 });
  });

  test("/profile 有特工帳戶主控台標題", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: /特工帳戶主控台/ })).toBeVisible({ timeout: 10000 });
  });

  test("/profile URL 可訪問（HTTP 200）", async ({ page }) => {
    const response = await page.goto("/profile");
    expect(response?.status()).toBe(200);
  });

  // TODO: LoginModal 守門完整測試需要 Supabase local emulator（確保 authLoading 快速 resolve）
  // 目前 Supabase 在 headless 模式連線慢，authLoading 無法在測試 timeout 內 resolve
  // 可用以下方式啟用：
  // test.skip("LoginModal 顯示（需 Supabase local）", ...)
});
