---
id: ADR-11
title: AuthContext 置於 layout.tsx 層，useAuth hook 統一消費，移除各頁面獨立訂閱
status: Accepted
date: 2026-06-02
references_to: [REF-004, F-010, F-011]
referenced_by: [ADR-10, F-011, F-013, ADR-13, F-015, ADR-15]
---

## 背景

`auth-topbar-unification` change（ADR-10）採用「TopBar 獨立 Client Component，各頁面 import」的方案，刻意保留了三個頁面各自維護 `onAuthStateChange` 訂閱的架構 debt。ADR-10 的「建議後續 change」欄位已明確指出需要此 change。

具體問題：
- `TopBar.tsx`、`profile/page.tsx`、`browse/page.tsx` 各自有獨立 `onAuthStateChange` 訂閱
- 每次路由切換 TopBar unmount/mount，造成訂閱重建（三次）
- Auth loading 閃爍在跨頁面導航時仍存在
- Auth state 分散，任何一頁面的 bug 都可能造成不一致顯示

## 決策

建立 `src/context/AuthContext.tsx`（`"use client"` Client Component），包含：
1. `AuthProvider`：唯一的 `onAuthStateChange` 訂閱，維護 `{ user, authLoading }` state
2. `useAuth()`：消費 hook，在 Provider 外呼叫時拋錯（型別安全）

在 `layout.tsx`（Server Component）import 並包裹 `<AuthProvider>`:
- `main` 區塊（含三個頁面 slot）
- `footer`
- `FloatingDock`

各消費端改用 `useAuth()` 取代本地 auth state + subscription：
- `TopBar.tsx`：移除本地 `onAuthStateChange`，改 `useAuth()`
- `profile/page.tsx`：移除本地 auth state + subscription，`useEffect([user?.id])` 載入 profile
- `browse/page.tsx`：移除 `isLoggedIn` subscription，`isLoggedIn = !!user` 來自 `useAuth()`

## 理由

| 考量 | 選擇依據 |
|---|---|
| 訂閱數量 | 從 3-4 個獨立訂閱降為 1 個（App 生命週期中唯一） |
| 閃爍問題 | auth state 在 layout 層初始化，各頁面不再各自有 loading 狀態 |
| 維護性 | auth 邏輯集中在一個檔案，bug 修復只需改一處 |
| Next.js 相容 | Server Component (layout.tsx) import Client Component (AuthProvider) 是 App Router 允許的正式模式 |
| 採用成本 | auth-topbar-unification 已完成基礎整合，此 change 只需移除分散訂閱並接 Context |

## 取捨 / 已知 Debt

- `useAuth()` 在 Server Component 中無法使用（Context 只在 Client Component 可用），但三個消費端均為 Client Component，此限制不影響當前架構
- `AuthProvider` 包裹的是 `main/footer/FloatingDock`，而非整個 `<body>`（保留 Server Component 的 streaming 優勢）
- `useAuth()` 在 Provider 外拋錯的設計讓誤用在開發期立即可見

## 影響範圍

- 新增：`src/context/AuthContext.tsx`
- 修改：`src/app/layout.tsx`（加入 AuthProvider 包裹）
- 修改：`src/components/TopBar.tsx`（移除訂閱，改 useAuth）
- 修改：`src/app/profile/page.tsx`（移除訂閱，改 useAuth）
- 修改：`src/app/browse/page.tsx`（移除訂閱，改 useAuth）

## 相關 ADR / Finding

- ADR-10：被本決策部分取代（TopBar 的 auth subscription 模式已升級為 Context 消費）
- REF-004：記錄 Next.js AuthContext pattern（本 ADR 的技術基礎）
- F-011：記錄 getUser 雙軌移除 + 全事件不過濾的實作決策
