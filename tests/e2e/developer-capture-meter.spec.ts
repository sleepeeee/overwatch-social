import { expect, test } from "@playwright/test";

test.describe("開發者據點佔領插件", () => {
  test("系統概覽不再顯示據點 HUD", async ({ page }) => {
    await page.goto("/developer");

    await expect(page.getByRole("heading", { name: "GIT OUTPOST LIVE HUD" })).toHaveCount(0);
    await expect(page.getByLabel("GIT OUTPOST LIVE HUD")).toHaveCount(0);
    await expect(page.getByText("儲存顯示名稱")).toHaveCount(0);
  });

  test("HUD 調整器在工具頁可開啟（完整重實作版）", async ({ page }) => {
    await page.goto("/developer/capture-hud");

    // 頂部控制面板
    await expect(page.getByRole("heading", { name: /Git Outpost Console/i })).toBeVisible();
    await expect(page.getByText("動態模擬佔領比率")).toBeVisible();

    // 陣營設定面板
    await expect(page.getByText("陣營屬性與倉庫所有權")).toBeVisible();
    await expect(page.getByRole("button", { name: /儲存配置/i })).toBeVisible();

    // 4 個 Tab 存在
    await expect(page.getByText("部署與使用手冊")).toBeVisible();
    await expect(page.getByText("資源下載")).toBeVisible();
    await expect(page.getByText("UX 狀態規格")).toBeVisible();
    await expect(page.getByText("向量代碼")).toBeVisible();

    // 手冊 tab 預設開啟（頁面載入後可見）
    await expect(page.getByText("自建伺服器 Git Hook 自動結算方案")).toBeVisible();
  });

  test("HUD 資源下載 Tab 含 SVG 素材下載", async ({ page }) => {
    await page.goto("/developer/capture-hud");

    // 點擊資源下載 tab
    await page.getByText("資源下載").click();
    await expect(page.getByText("控制雷達指針.svg")).toBeVisible();
    await expect(page.getByText("倉庫所有權徽章.svg")).toBeVisible();
  });
});
