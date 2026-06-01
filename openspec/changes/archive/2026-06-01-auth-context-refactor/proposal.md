# Proposal: auth-context-refactor

## Why

`auth-topbar-unification`（ADR-02）明確記錄了一個架構 debt：三個頁面（page.tsx、browse/page.tsx、profile/page.tsx）加上 TopBar.tsx 各自維護獨立的 Supabase `onAuthStateChange` 訂閱，總計 3-4 個並行訂閱，且每次路由切換都會重建/銷毀 TopBar 的訂閱。

Gemini §6.7 審查給出 5/10 並明確列出「No shared AuthContext — three separate auth state machines（Major）」。F-001 Finding 也標記此為後續必修的架構問題。

**Why Now**（外部觸發）：
- `auth-topbar-unification` 已上線（commit e211813/0a1a8c1），auth 守門正確運作，提供乾淨基線
- Gemini §6.7 明確要求此重構（Major 級別）
- 平台用戶量尚低，重構成本最小
- ADR-02 正式要求建立此 change

## What Changes

1. **新建 `src/context/AuthContext.tsx`**：single AuthProvider + useAuth hook，包含唯一的 onAuthStateChange 訂閱
2. **更新 `layout.tsx`**：用 AuthProvider 包裹所有頁面（Server Component 可 render Client AuthProvider）
3. **簡化 `TopBar.tsx`**：移除本地 auth subscription，改用 `useAuth()`
4. **簡化 `profile/page.tsx`**：移除本地 user/authLoading state 和 auth subscription，改用 `useAuth()`
5. **簡化 `browse/page.tsx`**：移除本地 isLoggedIn Supabase 訂閱，改用 `useAuth()` 派生

## Capabilities After Change

- 整個 app 只有 **一個** onAuthStateChange 訂閱（在 AuthProvider）
- auth state 是全域單一來源（single source of truth）
- 路由切換不重建訂閱
- auth loading 狀態全域統一，消除各頁面獨立 loading 閃爍
- 後續新增需要 auth 的功能只需 `useAuth()`，不需要重複寫 subscription

## Impact

- **影響範圍**：1 個新文件（AuthContext.tsx）+ 4 個修改（layout.tsx、TopBar.tsx、profile/page.tsx、browse/page.tsx）
- **資料庫**：無 schema 變更
- **行為破壞性**：零（auth 邏輯與 auth-topbar-unification 後相同，只是移到 Context）
- **相關 ADR**：ADR-02 取代（TopBar 決策升級為 AuthContext 決策）

## Related REFs

- REF-001: page.tsx TopBar Pattern（將被簡化）
- REF-004: Next.js App Router + AuthContext + Supabase 模式（主要技術參考）
- F-001: auth guard 架構 debt（此 change 解決）
- ADR-02: TopBar 決策（此 change 部分 supersede）
