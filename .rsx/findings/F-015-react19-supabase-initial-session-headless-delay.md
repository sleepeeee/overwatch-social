---
id: F-015
type: finding
title: React 19 + Supabase onAuthStateChange：INITIAL_SESSION 在 headless Playwright 中延遲或不觸發；getUser() 是必要的初始化機制
status: confirmed
confidence: high
references_to: [REF-018, ADR-11]
referenced_by: [ADR-15]
supporting_refs: [REF-018]
---

## 結論 / 數據

`e2e-test-coverage` change 的 Playwright 測試（20 個測試，desktop-chromium）在加回 `getUser()` 前，
`/profile` 的 auth guard 測試持續無法通過：authLoading spinner 永不消失，LoginModal 永不顯示。

根本原因：
- `onAuthStateChange` 的 `INITIAL_SESSION` 事件在 headless Playwright 環境中，
  由於 Supabase 連線延遲（無真實網路活動、無 JWT cookie），事件可能延遲數秒或完全不觸發。
- React 19 Strict Mode 下 `useEffect` 雙呼叫機制，導致第一次 `onAuthStateChange` 訂閱在 unmount 時被 unsubscribe，
  cancelled flag 保護機制在重新 mount 後才重建訂閱，若 `INITIAL_SESSION` 在這個空窗期到達則被丟棄。
- 原先的 `AuthContext.tsx` 依賴 `onAuthStateChange` 作為**唯一**初始化路徑，
  未使用 `getUser()` 做同步 fallback，導致 `authLoading` 在 headless 環境永遠維持 `true`。

**修正**（commit a2b041d）：
1. `AuthContext.tsx` 加回 `getUser()` 呼叫（與 `onAuthStateChange` 並行）
2. 加入 `cancelled` flag 防止 `getUser()` 的 `setState` 在 unmount 後觸發（React 19 Strict Mode race condition）
3. 在 `browse/page.tsx` 和 `profile/page.tsx` 移除 `authLoading` 全頁 spinner，
   改為讓 UI 以「未登入狀態」先行渲染，減少 UX 阻塞

量化影響：
- 修正前：`/profile` auth guard 測試在 headless 中 100% timeout（等待 LoginModal 永遠不出現）
- 修正後：20/20 Playwright 測試全通過（desktop-chromium project）
- `authLoading` spinner 移除後，/browse 和 /profile 在 headless 中均可正常初始化並渲染

## 與既有 REF 一致或矛盾

REF-018（Playwright E2E 策略）提到「Auth 守門行為（/profile 未登入顯示 LoginModal）」是 Layer 1 測試目標，
但未預料到 `INITIAL_SESSION` 延遲問題。本 Finding 補充了 REF-018 未涵蓋的 headless auth 初始化陷阱。

ADR-11（AuthContext at layout + useAuth hook）確立了「AuthContext 作為全域 auth 狀態源」，
本 Finding 揭示了該設計在 headless 環境中的弱點，並以 `getUser() + cancelled flag` 補強。

## 對後續影響

1. **AuthContext 設計規則**：
   Supabase auth 初始化必須同時使用兩條路徑：
   - `getUser()`：同步確認當前 session（不依賴事件）
   - `onAuthStateChange`：訂閱後續狀態變更
   任何只依賴 `onAuthStateChange` 的初始化邏輯在 headless / SSR / 低延遲環境均有風險。

2. **authLoading spinner 設計**：
   全頁 authLoading spinner 在 headless 測試環境中是測試阻塞點，
   建議改為 optimistic rendering（先顯示未登入 UI，auth 完成後更新），
   而非 blocking spinner（等 auth 完成才渲染）。

3. **React 19 Strict Mode + Supabase**：
   在 React 19 Strict Mode 中，任何基於副作用的訂閱（`onAuthStateChange`、`supabase.channel()`）
   都必須有對應的 cleanup + cancelled flag，以防雙呼叫期間的 state update 污染。
