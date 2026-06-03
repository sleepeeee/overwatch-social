---
id: ADR-13
title: useDevMode 不再維護獨立 auth 訂閱，統一消費 AuthContext（useAuth hook）
status: Accepted
date: 2026-06-02
references_to: [REF-016, ADR-11, F-013]
referenced_by: [F-013]
---

## 背景

`browse-quality-fixes` change 的審計源頭 REF-016（7 大品質問題）的問題 6 指出：

> `useDevMode.ts:29` 有獨立 `onAuthStateChange` 訂閱，與 `AuthContext.tsx:24`（全域唯一訂閱）並行，
> 造成兩個獨立訂閱同時存在，違反 ADR-11 確立的「全應用唯一 auth 訂閱」原則。

`ADR-11` 已決定所有 auth 消費端改用 `useAuth()` hook，但 `useDevMode` 未納入當時的
`auth-context-refactor` change 修改範圍（屬於 browse-quality-fixes 的一部分）。

原始 `useDevMode` 實作（修改前）：
```typescript
// useDevMode.ts — 修改前
export function useDevMode() {
  const [isDeveloper, setIsDeveloper] = useState(false);
  useEffect(() => {
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsDeveloper(session?.user?.app_metadata?.role === 'developer');
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  return { isDeveloper };
}
```

## 決策

移除 `useDevMode` 的獨立 `onAuthStateChange` 訂閱，改為消費 `AuthContext` via `useAuth()`：

```typescript
// useDevMode.ts — 修改後
import { useAuth } from '@/context/AuthContext';

export function useDevMode() {
  const { user } = useAuth();
  return {
    isDeveloper: user?.app_metadata?.role === 'developer' ?? false,
  };
}
```

同步決策：`DevModeBanner` 元件從 `layout.tsx` 直接渲染移入 `AuthProvider` render return 內部
（見 F-013：Provider 內外的 Context 邊界原因）。

## 理由

| 考量 | 選擇依據 |
|---|---|
| auth 訂閱數量 | 維持 ADR-11 確立的「全應用唯一 `onAuthStateChange` 訂閱」；多餘訂閱有記憶體洩漏風險 |
| 程式碼量 | 修改後 useDevMode 從 16 行縮至 5 行（含 import），複雜度大幅降低 |
| 一致性 | 所有 auth 消費端（TopBar、pages、useDevMode）統一走 useAuth()，無例外 |
| 響應即時性 | useAuth() 消費的是 AuthContext state，AuthProvider 的訂閱已覆蓋 auth 狀態變化，無需重複訂閱 |
| 可測試性 | 消費 Context 的 hook 比有 side-effect 訂閱的 hook 更易 mock 測試 |

## 取捨 / 已知 Debt

- `useDevMode()` 現在必須在 `AuthProvider` 元件樹內使用，不能在 Provider 外（含 layout.tsx Server Component 層）直接呼叫。此限制與 `useAuth()` 相同，屬預期行為（F-013 詳述）。
- `app_metadata.role` 由 Supabase 後端設定，前端只讀取不寫入；developer 判斷邏輯維持在 hook 內，不擴散到各消費元件。
- 若未來需要「developer 模式的 non-auth 面向功能」（如 local feature flag），可在此 hook 擴展，不影響 auth 整合架構。

## 影響範圍

- 修改：`src/hooks/useDevMode.ts`（移除獨立訂閱，改 useAuth）
- 修改：`src/app/layout.tsx`（移除直接渲染 DevModeBanner，改在 AuthProvider 內渲染）
- 修改：`src/context/AuthContext.tsx`（在 AuthProvider return 中加入 DevModeBanner 渲染）
- 刪除：`src/components/Navbar.tsx`（dead code，獨立 auth 訂閱的另一個來源）
- 刪除：`src/components/AppSidebar.tsx`（dead code）

## 相關 ADR / Finding / REF

- ADR-11：確立 AuthContext at layout 層 + useAuth hook 統一消費（本 ADR 為其延伸執行）
- REF-016：7 大品質問題審計（問題 2 Dead Code + 問題 6 Auth 訂閱多頭馬車，本 ADR 解決兩者）
- F-013：DevModeBanner 必須置於 AuthProvider 內（解釋為何位置移動是架構必要性）
