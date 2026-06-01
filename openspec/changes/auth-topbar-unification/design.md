# Design: auth-topbar-unification

## Context

Next.js 15 App Router 專案，全部頁面為 `"use client"` Client Components（因需 Supabase onAuthStateChange hook）。Layout 為 Server Component + Client children 混合架構。

## Goals

- G1: TopBar UI 在三個頁面完全一致
- G2: profile 頁未登入時 LoginModal 正確守門
- G3: browse 頁 isLoggedIn 來自真實 Supabase auth

## Non-Goals

- 不修改 FloatingDock 導航列
- 不修改 LoginModal 元件本身（已完整）
- 不修改資料庫 schema
- 不引入新的 auth provider 或 state management library

---

## D1 — TopBar 共用策略：獨立元件 vs Layout 注入

| 方案 | 優點 | 缺點 |
|---|---|---|
| **A. 獨立 `TopBar.tsx` 元件（選擇）** | 各頁面可控制掛載時機；與頁面 user state 無需 prop drilling | 三個頁面各自維護 user state（有輕微重複）|
| B. Layout 層注入 | 全域一次管理 | Layout 是 Server Component，無法直接用 Supabase client auth hook；需額外 wrapper |

**選擇 A**：TopBar 為獨立 Client Component，自己管理 user state（onAuthStateChange）。各頁面 import 並放在頁面頂部。複用度高，且不需要修改 layout 架構。

## D2 — profile 頁 user state 修復策略

**唯一正確方案**：移除三處 mock fallback，`useState<User | null>(null)` 初始值改 null。

無替代方案討論空間：mock user 是開發時的臨時 hack，正式環境必須移除。

**注意**：移除 mock 後，`user` 可能在 `getUser()` 非同步回來前是 null。`authLoading` state 已存在但未正確使用：`setAuthLoading(false)` 在 `getUser()` callback 後觸發，但初始值也是 false，導致 LoginModal 可能在 getUser 回來前短暫閃現。

**解法**：`authLoading` 初始值改為 `true`，`getUser()` callback 後設為 `false`，這樣 LoginModal `show={isMounted && !authLoading && !user}` 才不會在 hydration 期間閃爍。

## D3 — TopBar 元件的 logout redirect

**問題**：logout 後若在 /profile 頁，應跳回首頁（因為 /profile 需要登入）。  
**解法**：TopBar logout handler 用 `usePathname()` 判斷，若在 `/profile` 則 `router.push('/')` 後再登出；其他頁面維持 `router.refresh()`。

或更簡單：logout 後統一 `router.push('/')`，讓 /profile 的 LoginModal 自然觸發。

**選擇**：logout 後統一 `router.push('/')`（最簡單、行為最可預期）。

## D4 — browse 頁的 isLoggedIn 用途

browse/page.tsx 的 `isLoggedIn` 傳給 `OverwatchSquare` 等子元件，用於控制名片顯示詳細程度（未登入遮蔽某些資訊）。

移除模擬開關後，isLoggedIn 仍保留作為 derived state，只是改為只從 Supabase 讀取，不允許手動覆寫。

---

## 實際時間估算

| Task | 預估 |
|---|---|
| 建立 TopBar.tsx | 10 min |
| 更新 page.tsx | 5 min |
| 更新 browse/page.tsx | 10 min |
| 更新 profile/page.tsx | 15 min |
| 驗證 end-to-end | 10 min |
| **合計** | **~50 min** |

Wall-clock < 1 hr，不觸發 §3.3 Smoke Test。

---

## Rationale 表（技術選擇 ↔ REF）

| 決策 | 選擇 | 依據 |
|---|---|---|
| TopBar 共用策略 | 獨立元件 | REF-001 基準實作可直接抽取 |
| profile mock user 修復 | 移除所有 mock fallback | REF-002 完整問題分析 |
| browse 模擬開關移除 | 完整移除 + 保留 isLoggedIn 只讀 | REF-003 問題說明 |
| logout redirect | 統一 router.push('/') | D3 最簡單策略 |
| authLoading 初始值 | 改為 true | D2 閃爍問題分析 |
