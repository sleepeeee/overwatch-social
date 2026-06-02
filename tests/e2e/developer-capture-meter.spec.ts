import { expect, test } from "@playwright/test";

test.describe("開發者據點佔領插件", () => {
  test("在開發者主控台顯示據點 HUD", async ({ page }) => {
    await page.goto("/developer");

    await expect(page.getByRole("heading", { name: "開發者據點佔領" })).toBeVisible();
    await expect(page.getByLabel("開發者據點佔領")).toContainText(/Shadowmaster6g\s*50%/);
    await expect(page.getByLabel("開發者據點佔領")).toContainText(/sleepeeee\s*50%/);
    await expect(page.getByLabel("開發者據點佔領")).toContainText("REPO: sleepeeee/overwatch-social");
    await expect(page.getByRole("button", { name: "儲存顯示名稱" })).toBeVisible();
  });
});
