import { expect, test } from "@playwright/test";

test.describe("開發者據點佔領插件", () => {
  test("系統概覽不再顯示據點 HUD", async ({ page }) => {
    await page.goto("/developer");

    await expect(page.getByRole("heading", { name: "GIT OUTPOST LIVE HUD" })).toHaveCount(0);
    await expect(page.getByLabel("GIT OUTPOST LIVE HUD")).toHaveCount(0);
    await expect(page.getByText("儲存顯示名稱")).toHaveCount(0);

    await page.locator("select").evaluate((element, value) => {
      const select = element as HTMLSelectElement;
      select.value = value as string;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }, "tools");
    await expect(page.getByText("開發者據點 HUD 調整器")).toBeVisible();
  });

  test("HUD 調整器在工具頁可開啟", async ({ page }) => {
    await page.goto("/developer/capture-hud");

    await expect(page.getByRole("heading", { name: "GIT OUTPOST CONSOLE" })).toBeVisible();
    await expect(page.getByText("動態模擬佔領比率")).toBeVisible();
    await expect(page.getByRole("button", { name: "儲存顯示名稱" })).toBeVisible();
    await expect(page.getByText("資源打包下載")).toBeVisible();
    await expect(page.getByText("控制雷達指針.svg")).toBeVisible();
    await expect(page.getByText("// 深色模式色相")).toBeVisible();
    await expect(page.getByText("// 淺色模式色相")).toBeVisible();
    await expect(page.getByLabel("背景 色彩").first()).toBeVisible();
  });
});
