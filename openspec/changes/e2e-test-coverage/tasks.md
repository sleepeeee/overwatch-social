# Tasks: e2e-test-coverage

## Task 1 — auth-guard.spec.ts

- [ ] 建立 `tests/e2e/auth-guard.spec.ts`
- [ ] 測試：未登入訪問 /profile → LoginModal 顯示
- [ ] 測試：LoginModal 有 Google 登入按鈕

---

## Task 2 — browse.spec.ts

- [ ] 建立 `tests/e2e/browse.spec.ts`
- [ ] 測試：廣場有三個遊戲 Tab
- [ ] 測試：搜尋欄可以輸入
- [ ] 測試：廣場載入卡片（或 Mock 提示條）
- [ ] 測試：TopBar 有 Google 登入按鈕（未登入）

---

## Task 3 — player-detail.spec.ts（使用 page.route() mock）

- [ ] 建立 `tests/e2e/player-detail.spec.ts`
- [ ] `beforeEach`：用 `page.route()` mock Supabase REST `/public_profiles*`
  - MOCK_PLAYER_ID → 回傳測試玩家資料
  - 其他 ID → 回傳空陣列
- [ ] 測試：mock 玩家詳細頁顯示 BattleTag
- [ ] 測試：有返回廣場連結
- [ ] 測試：不存在的 ID 顯示 not found 訊息
- [ ] 測試：未登入時聯絡方式顯示「登入後才能查看」

---

## Task 4 — home.spec.ts

- [ ] 建立 `tests/e2e/home.spec.ts`
- [ ] 測試：首頁有主標語
- [ ] 測試：TopBar 有 Logo 和 Google 登入按鈕
- [ ] 測試：有建立名片和廣場按鈕
- [ ] 測試：點廣場按鈕可到 /browse

---

## Task 5 — 執行與驗證

- [ ] `npm run dev &`（背景啟動 dev server）
- [ ] `npx playwright test` 全部通過
- [ ] 如有失敗：修正 selector 或 timeout
- [ ] `git commit && git push`
