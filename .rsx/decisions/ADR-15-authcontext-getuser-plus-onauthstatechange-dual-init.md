---
id: ADR-15
title: AuthContext 同時使用 getUser() + onAuthStateChange（cancelled flag 防 race condition），而非只用 onAuthStateChange
status: Accepted
date: 2026-06-03
references_to: [ADR-11, F-015, REF-018]
referenced_by: []
---

## 背景

`e2e-test-coverage` change 新增 Playwright E2E 測試後，發現 `/profile` auth guard 測試在 headless 環境
持續 timeout：`authLoading` spinner 永不消失，導致 LoginModal 永遠不渲染。

排查後確認根本原因（詳見 F-015）：
- `AuthContext.tsx`（ADR-11 確立）原本只依賴 `onAuthStateChange` 進行初始化
- Supabase `INITIAL_SESSION` 事件在 headless Playwright 中延遲或不觸發
- React 19 Strict Mode 雙呼叫導致事件可能在訂閱空窗期丟失
- 結果：`authLoading` 在 headless 永遠為 `true`，所有依賴 auth 完成的 UI 全數阻塞

## 決策

AuthContext 初始化改為**雙路徑並行**：

```typescript
useEffect(() => {
  let cancelled = false;

  // 路徑 1：getUser() — 不依賴事件，主動取得當前 session
  supabase.auth.getUser().then(({ data }) => {
    if (!cancelled) {
      setUser(data.user ?? null);
      setAuthLoading(false);
    }
  });

  // 路徑 2：onAuthStateChange — 訂閱後續狀態變更（登入/登出/Token 刷新）
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (!cancelled) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    }
  );

  return () => {
    cancelled = true;
    subscription.unsubscribe();
  };
}, []);
```

同步移除 `browse/page.tsx` 和 `profile/page.tsx` 的 `authLoading` 全頁 spinner，
改為 optimistic rendering（先以未登入狀態渲染，auth 完成後更新）。

## 理由

| 考量 | 選擇依據 |
|---|---|
| 測試可靠性 | `getUser()` 直接呼叫 Supabase REST API，不依賴事件機制，headless 環境中可靠 |
| 生產環境相容 | `onAuthStateChange` 仍是 Token 刷新與登入/登出的正確訂閱機制，不應移除 |
| React 19 Strict Mode | `cancelled` flag 防止 unmount 後的 `setState`，雙呼叫安全 |
| UX 改善 | 移除全頁 spinner → optimistic rendering，冷啟動頁面不再全白 |
| 最小侵入性 | 只修改 AuthContext.tsx init 路徑，不影響下游 `useAuth()` hook 介面 |

## 取捨 / 已知 Debt

- `getUser()` 和 `onAuthStateChange` 都會設定 `user` state，存在雙重觸發，
  但 React 的 state batching 確保不會有多餘重渲染（兩路均設定相同值時合併）。
- Optimistic rendering（先顯示未登入 UI）可能導致短暫 FOUC（Flash of Unauthenticated Content），
  但這優於全頁 spinner 阻塞整個頁面初始渲染。若未來需要消除 FOUC，可改用 server-side session check（Next.js cookies()）。
- 若未來 Supabase SDK 版本修正 headless 環境的 INITIAL_SESSION 問題，`getUser()` 路徑仍可保留作為 defense-in-depth。

## 影響範圍

- 修改：`src/context/AuthContext.tsx`（加回 `getUser()` + `cancelled` flag）
- 修改：`src/app/browse/page.tsx`（移除 `authLoading` 全頁 spinner）
- 修改：`src/app/profile/page.tsx`（移除 `authLoading` 全頁 spinner）
- 新增：`tests/e2e/auth-guard.spec.ts`、`browse.spec.ts`、`player-detail.spec.ts`、`home.spec.ts`（20 個測試）

## 相關 ADR / Finding / REF

- ADR-11：AuthContext at layout + useAuth hook（本 ADR 在其基礎上補強 init 路徑）
- F-015：React 19 + Supabase INITIAL_SESSION 在 headless 延遲的根本原因分析
- REF-018：Playwright E2E 測試策略（Layer 1 測試中 auth guard 測試的依賴）
