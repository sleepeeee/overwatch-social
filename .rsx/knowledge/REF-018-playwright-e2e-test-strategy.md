---
id: REF-018
type: docs
title: OW Social Playwright E2E 測試策略
url: n/a
status: active
references_to: [REF-016]
referenced_by: [F-015, ADR-15]
---

## 現有狀態

- `playwright.config.ts`：baseURL = `http://127.0.0.1:3000`，Desktop/Mobile viewport，無 auth fixtures
- 現有測試：`home-responsive.spec.ts`（2 個 UI 可見性測試）、`browse-screenshots.spec.ts`（截圖回歸）
- 無任何 auth mock / fixture / DB fixture

## MVP 測試範圍原則

Google OAuth 完整 mock 需要：JWT secret、cookie 格式、Supabase session structure。
對於 MVP e2e 測試，採取分層策略：

**Layer 1（無需 auth）**：
- 公開頁面 UI 結構驗證（/, /browse, /player/[id]）
- Auth 守門行為（/profile 未登入顯示 LoginModal）
- Browse 搜尋 UI 可互動性（輸入、過濾 UI 更新）

**Layer 2（需 auth，未來 Change）**：
- Profile save 流程（需 Supabase session mock 或 local emulator）
- 完整交友流程（登入 → 儲存名片 → 廣場出現）

## 測試框架使用模式

```typescript
// 基本頁面測試
test('頁面標題正確', async ({ page }) => {
  await page.goto('/browse');
  await expect(page).toHaveTitle(/OW Social/);
});

// 等待動態內容
test('廣場載入卡片', async ({ page }) => {
  await page.goto('/browse');
  // 等待 grid 出現（廣場載入需要時間）
  await page.waitForSelector('.cloud-paper-panel', { timeout: 10000 });
  await expect(page.locator('.cloud-paper-panel')).toBeVisible();
});

// Auth 守門
test('未登入進 /profile 看到 LoginModal', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByText('登入後才能使用主控台')).toBeVisible({ timeout: 8000 });
});
```

## 測試資料

- 測試用玩家：`user_id = 1b6d1e5d-f388-41dc-9467-b7bb1368de21`（星辰指引者#8847，已存在 production DB）
- `/player/1b6d1e5d-f388-41dc-9467-b7bb1368de21` 可用於驗證詳細頁

## 注意事項

- 測試針對 production Supabase（不隔離）→ 測試資料需持久存在
- CI/CD 執行前需 `npm run dev` 在背景啟動（playwright.config.ts webServer 設定已有）
- Mobile viewport 測試使用 390×1200
