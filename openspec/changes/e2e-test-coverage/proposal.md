# Proposal: e2e-test-coverage

## Why

批評信第 7 條：「Zero tests。我們的品質保證機制是：我點了一下，好像沒壞。」

目前的現實：
- 2 個測試（首頁元素可見性、手機不橫向爆版）
- 無登入守門測試、無廣場搜尋測試、無詳細頁測試
- 每次有人推新 code，都是「信仰之跳」——不知道有沒有把某個功能改壞

**Why Now**：
- auth 修復、廣場搜尋、玩家詳細頁都剛完成，是補測試的最佳時機
- 測試資料（星辰指引者#8847）已在 DB，可以真實測試端到端
- 之後朋友繼續開發，有測試才能知道有沒有回歸

## What Changes

在 `tests/e2e/` 新增 4 個測試檔案，涵蓋平台核心流程：

1. **`auth-guard.spec.ts`**：Auth 守門行為（未登入訪問 /profile 看到 LoginModal）
2. **`browse.spec.ts`**：廣場功能（Tab 切換、搜尋欄互動、卡片渲染）
3. **`player-detail.spec.ts`**：玩家詳細頁（用真實測試資料驗證內容）
4. **`home.spec.ts`**：首頁核心元素（取代舊的 home-responsive，更完整）

## Scope 限制（MVP）

OAuth 完整 flow 不在本次範圍（需要 JWT secret 或 Supabase local emulator）。本次只測試：
- 公開頁面 + 守門行為
- 不需要真實登入的互動（搜尋 UI、頁面跳轉）

登入後功能的測試（profile save）留給 Change D（`e2e-auth-flow`）。

## Impact

- **新建**：4 個測試檔案（`tests/e2e/`）
- **更新**：`home-responsive.spec.ts` 合入新的 `home.spec.ts`，舊檔案可以保留或刪除
- **破壞性**：零

## Related REFs

- REF-007: 問題 7（零測試）
- REF-009: Playwright E2E 測試策略
