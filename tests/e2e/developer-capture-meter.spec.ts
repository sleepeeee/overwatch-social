import { expect, test } from "@playwright/test";

test.describe("開發者據點佔領插件", () => {
<<<<<<< HEAD
  test("在開發者主控台顯示據點 HUD", async ({ page }) => {
=======
  test("在開發者主控台顯示只讀據點 HUD", async ({ page }) => {
>>>>>>> origin/visual/browse-dual-style-lab
    await page.goto("/developer");

    await expect(page.getByRole("heading", { name: "開發者據點佔領" })).toBeVisible();
    await expect(page.getByLabel("開發者據點佔領")).toContainText(/Shadowmaster6g\s*50%/);
    await expect(page.getByLabel("開發者據點佔領")).toContainText(/sleepeeee\s*50%/);
    await expect(page.getByLabel("開發者據點佔領")).toContainText("REPO: sleepeeee/overwatch-social");
<<<<<<< HEAD
=======
    await expect(page.getByText("儲存顯示名稱")).toHaveCount(0);
  });

  test("HUD 調整器在工具頁可開啟", async ({ page }) => {
    await page.goto("/developer/capture-hud");

    await expect(page.getByRole("heading", { name: "開發者據點 HUD 調整器" })).toBeVisible();
    await expect(page.getByText("這裡只管插件畫面名稱")).toBeVisible();
    await expect(page.getByRole("button", { name: "儲存顯示名稱" })).toBeVisible();
>>>>>>> origin/visual/browse-dual-style-lab
  });
});
