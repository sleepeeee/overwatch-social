# 2026-06-03-e2e-test-coverage 歸檔報告

> 日期：2026-06-03
> Change：`e2e-test-coverage`
> Finding：F-006（status: confirmed）
> §6.7 審查：Gemini 4/10 → 修正 → PASS
> 報告產生方式：/rsx:archive Step 6 自動生成

---

## Layer 1 — 30 秒速覽

**一句話結論**：批評信第 7 條「零測試」現在有 20 個 E2E 測試守護核心頁面，同時解決了一個隱藏在 React 19 + Supabase 組合中的 bug——`onAuthStateChange` 在某些環境下不觸發，造成頁面永久 loading。

### 數字速查表

| 指標 | 數值 | 白話意義 |
|---|---|---|
| 新增測試 | 20 個 | 從 0 到有，每次改 code 不再是信仰之跳 |
| 測試通過率 | 100%（desktop） | 全部 green |
| 發現的 Bug | 1 個（React 19 + Supabase）| authLoading 在 headless 環境永不 resolve |
| AuthContext 修正 | getUser() + cancelled flag | 加回快速初始化路徑 |
| 移除的 spinner | 2 個（browse/profile）| 改善 UX |

### 決策速查

- ❌ 被關掉的路：LoginModal 完整 auth-guard 測試（需要 Supabase local emulator）
- ✅ 被確認的路：page.route() mock 對 Server Component 無效，只適合 Client-side fetch
- ➡️ 下一步建議：Change D（e2e-auth-flow，使用 Supabase local emulator 測試完整登入流程）

---

## Layer 2 — 完整報告

### A. 為什麼做這個

批評信 7 條，最後一條：「每次 deploy 都是一場賭博，每次改 code 都是一次信仰的跳躍。」截至 Change B 完成前，這個平台只有 2 個測試（首頁元素可見性、手機不橫向爆版）。

### B. 最大的意外：React 19 + Supabase 在 headless 中卡死

原本的計畫：測試應該可以在 Playwright 中正常跑，因為 dev server 在跑，Supabase 可連線。

實際發生的：所有需要等 `authLoading=false` 的測試都超時（30 秒後仍顯示 spinner）。

**根本原因（F-006）**：
- AuthContext 只使用 `onAuthStateChange` 等待 `INITIAL_SESSION`
- 在 React 19 Strict Mode 中，`useEffect` 的 cleanup 函數在某些情況會阻止 setTimeout 正常觸發
- Supabase realtime WebSocket 在 headless Chromium 中也可能延遲 INITIAL_SESSION 事件

**修法**：加回 `getUser()`（被我們之前移除），它不依賴 WebSocket，直接 HTTP 請求確認 auth 狀態。

### C. 技術亮點

**page.route() 對 Server Component 無效** — 這是關鍵認識。Playwright 的 route mock 只攔截瀏覽器端的 HTTP 請求。Server Component 的 Supabase query 在 Node.js server 端執行，完全不通過瀏覽器，所以 mock 無效。只能用 not-found case（不需要 DB 的測試）來測試 Server Component 行為。

### D. 未來測試路線

| 測試類型 | 目前狀態 | 需要什麼 |
|---|---|---|
| 公開頁面 UI | ✅ 20 個測試 | 已完成 |
| Auth 守門（LoginModal 完整）| ⬜ 待做 | Supabase local emulator |
| Profile save | ⬜ 待做 | Auth session mock |
| 廣場完整互動 | ⬜ 待做 | Auth session mock |

### G. 技術索引

| 類型 | ID / 路徑 |
|---|---|
| Finding | F-006（React 19 Supabase headless 問題）|
| ADR | ADR-07（AuthContext getUser() + onAuthStateChange 雙軌）|
| 測試檔案 | `tests/e2e/auth-guard.spec.ts`, `browse.spec.ts`, `home.spec.ts`, `player-detail.spec.ts` |
| AuthContext 修正 | `src/context/AuthContext.tsx` |
| Commit | `a2b041d` |
