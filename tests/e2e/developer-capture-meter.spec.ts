import { expect, test } from "@playwright/test";

test.describe("開發者據點佔領插件", () => {
  test("在開發者主控台顯示只讀據點 HUD", async ({ page }) => {
    await page.goto("/developer");

    await expect(page.getByRole("heading", { name: "開發者據點佔領" })).toBeVisible();
    await expect(page.getByLabel("開發者據點佔領")).toContainText(/Shadowmaster6g\s*50%/);
    await expect(page.getByLabel("開發者據點佔領")).toContainText(/sleepeeee\s*50%/);
    await expect(page.getByLabel("開發者據點佔領")).toContainText("REPO: sleepeeee/overwatch-social");
    await expect(page.getByText("儲存顯示名稱")).toHaveCount(0);
  });

  test("HUD 調整器在工具頁可開啟", async ({ page }) => {
    await page.goto("/developer/capture-hud");

    await expect(page.getByRole("heading", { name: "GIT OUTPOST CONSOLE" })).toBeVisible();
    await expect(page.getByText("動態模擬佔領比率")).toBeVisible();
    await expect(page.getByText("按下保存後前台 HUD 才會更新")).toBeVisible();
    await expect(page.getByText("資源打包下載")).toBeVisible();
    await expect(page.getByText("控制雷達指針.svg")).toBeVisible();
    await expect(page.getByText("// 深色模式色相")).toBeVisible();
    await expect(page.getByText("// 淺色模式色相")).toBeVisible();
    await expect(page.getByRole("button", { name: "儲存顯示名稱" })).toBeVisible();
  });
});
