# Design: e2e-test-coverage

## Context

Playwright 框架已設定（`playwright.config.ts`，baseURL = `http://127.0.0.1:3000`）。現有 2 個測試，涵蓋首頁 UI 和截圖。無 auth fixtures。

## Goals

- G1: 未登入守門行為有測試
- G2: 廣場頁面核心 UI 有測試
- G3: 玩家詳細頁有測試（使用真實測試資料）
- G4: 首頁核心結構有測試（比現有更完整）

## Non-Goals

- 不測試 Google OAuth 完整 flow
- 不測試 Profile save（需要 auth）
- 不測試 Developer console（需要 developer role）

---

## D1 — auth-guard.spec.ts

測試 `/profile` 在未登入狀態下的守門行為：

```typescript
test('未登入訪問 /profile → 顯示 LoginModal', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByText('登入後才能使用主控台')).toBeVisible({ timeout: 8000 });
});

test('LoginModal 有 Google 登入按鈕', async ({ page }) => {
  await page.goto('/profile');
  await expect(page.getByRole('button', { name: /google/i })).toBeVisible({ timeout: 8000 });
});
```

## D2 — browse.spec.ts

測試廣場頁面的 UI 行為：

```typescript
test('廣場頁面有三個遊戲 Tab', async ({ page }) => {
  await page.goto('/browse');
  await expect(page.getByText('Overwatch')).toBeVisible();
  await expect(page.getByText('Valorant')).toBeVisible();
  await expect(page.getByText('LoL')).toBeVisible();
});

test('搜尋欄可以輸入', async ({ page }) => {
  await page.goto('/browse');
  const searchInput = page.getByPlaceholder(/搜尋玩家/i);
  await searchInput.fill('安娜');
  await expect(searchInput).toHaveValue('安娜');
});

test('廣場載入篩選區（代表 JS hydration 完成）', async ({ page }) => {
  await page.goto('/browse');
  // 等待篩選絲帶出現（代表元件 hydrated），不用 waitForTimeout
  await expect(page.getByText(/遊玩伺服器/)).toBeVisible({ timeout: 10000 });
});

test('TopBar 在廣場頁有 Google 登入按鈕（未登入）', async ({ page }) => {
  await page.goto('/browse');
  await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
});
```

## D3 — player-detail.spec.ts（Gemini C1 修正：使用 page.route() mock，不依賴 production DB）

使用 `page.route()` 攔截 Supabase REST API，不依賴真實 DB 資料：

```typescript
const MOCK_PLAYER_ID = 'mock-player-test-id';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

test.beforeEach(async ({ page }) => {
  // Mock /player/[id] 的 Supabase query（public_profiles view）
  await page.route(`${SUPABASE_URL}/rest/v1/public_profiles*`, route => {
    const url = route.request().url();
    if (url.includes(MOCK_PLAYER_ID)) {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([{
          user_id: MOCK_PLAYER_ID,
          battle_tag: '測試玩家#0000',
          is_tag_visible: true,
          selected_heroes: ['ana', 'mercy'],
          tags: ['認真組排'],
          message: '這是 E2E 測試用的玩家',
          languages: ['繁體中文'],
          mic_status: 'mic-on',
          mbti: 'INFJ',
          updated_at: new Date().toISOString(),
          server: 'Asia Server'
        }])
      });
    } else {
      route.fulfill({ contentType: 'application/json', body: '[]' });
    }
  });
});

test('玩家詳細頁顯示 BattleTag', async ({ page }) => {
  await page.goto(`/player/${MOCK_PLAYER_ID}`);
  await expect(page.getByText('測試玩家#0000')).toBeVisible({ timeout: 8000 });
});

test('玩家詳細頁有返回廣場連結', async ({ page }) => {
  await page.goto(`/player/${MOCK_PLAYER_ID}`);
  await expect(page.getByText(/返回廣場/)).toBeVisible({ timeout: 8000 });
});

test('不存在的玩家 ID → 顯示 not found', async ({ page }) => {
  // 這個 ID 會被 mock 回空陣列
  await page.goto('/player/00000000-0000-0000-0000-000000000000');
  await expect(page.getByText(/不存在或已將名片設為私密/)).toBeVisible({ timeout: 8000 });
});

test('未登入時聯絡方式顯示登入提示', async ({ page }) => {
  await page.goto(`/player/${MOCK_PLAYER_ID}`);
  await expect(page.getByText(/登入後才能查看/i)).toBeVisible({ timeout: 8000 });
});
```

**注意**：`NEXT_PUBLIC_SUPABASE_URL` 在 `.env.local` 中設定，playwright 測試時可從 process.env 讀取（Next.js 在 build/dev 時注入）。

## D4 — home.spec.ts

更完整的首頁測試（取代 home-responsive.spec.ts 的部分）：

```typescript
test('首頁有主標語', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/最佳遊戲搭檔/)).toBeVisible();
});

test('首頁 TopBar 有 Logo 和登入按鈕', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/After Midnight/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
});

test('首頁有建立名片和廣場按鈕', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /建立遊戲名片/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /漫步玩家廣場/ })).toBeVisible();
});

test('從首頁點廣場按鈕可到 /browse', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /漫步玩家廣場/ }).click();
  await expect(page).toHaveURL('/browse');
});
```

---

## 測試穩定性考量

- **timeout**：8000ms（Supabase query + hydration 都需要時間）
- **NOT screenshot-based**：文字/元素可見性比截圖穩定（UI 改版不會讓測試失敗）
- **Selector 策略**：優先用 `getByText` 和 `getByRole`（比 CSS class 更穩定）
- **避免時序假設**：`waitForTimeout` 只用在「等待動態載入」，不用在固定頁面

---

## 實際時間估算

| Task | 預估 |
|---|---|
| auth-guard.spec.ts | 15 min |
| browse.spec.ts | 20 min |
| player-detail.spec.ts | 20 min |
| home.spec.ts | 15 min |
| 執行測試驗證 | 10 min |
| **合計** | **~80 min** |
