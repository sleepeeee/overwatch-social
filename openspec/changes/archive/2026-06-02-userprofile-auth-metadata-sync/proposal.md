---
id: userprofile-auth-metadata-sync
type: change
status: proposing
created: 2026-06-03
affects_consumers: []
related_claims: []
---

# Proposal: userprofile-auth-metadata-sync

## Why（動機）

`profile/page.tsx` 的 `UserProfile` 狀態（`display_name`、`avatar_url`）從 `localStorage.getItem("user_profile_hub")` 初始化，導致：

1. **清除瀏覽器快取後 display_name 歸零**（回到硬編碼預設值「愛喝奶茶」）
2. **Google OAuth 的 `user_metadata`（full_name、avatar_url）被完全忽略**，等於用戶登入後看不到自己的 Google 帳號名稱
3. **`UserProfile` 型別定義在 `types/card.ts`** 但無對應 DB 表，與 `OWPlayerCard` 邏輯上不相關，是架構層的型別定位錯誤

**Why now（內部排序）**：auth 架構在前幾個 change 已穩定（ADR-03/07），`share-page-completion` change 即將使用 `AuthContext`，趁架構穩定、功能擴展前修正這個初始化問題。

**先例缺口**：REF-003（Google OAuth PKCE）記錄了登入流程，REF-005（app_metadata）記錄了角色控制。但**兩者均未觸及 `user_metadata.full_name/avatar_url` 的前端消費**（REF-013 為本 change 新建）。

## What Changes

1. **新建 `src/types/auth.ts`**：移出 `UserProfile` interface（`id`、`display_name`、`avatar_url`、`bio?`）
2. **修改 `src/types/card.ts`**：`UserProfile` 改為 re-export from `@/types/auth`
3. **修改 `src/context/AuthContext.tsx`**：加入 `userProfile: UserProfile | null` state，在 `getUser()` 和 `onAuthStateChange` 兩條路徑均從 `user.user_metadata` 衍生
4. **修改 `src/app/profile/page.tsx`**：`userProfile` state 初始化改為 per-user localStorage key（`user_profile_hub_{userId}`）+ Auth metadata seed（localStorage 優先，無快取時用 authUserProfile）

## Capabilities（修改後）

- 登入後訪問 `/profile`，「通用帳戶暱稱」自動顯示 Google 帳戶名稱（`full_name`）
- 清除 localStorage 後重整，名稱仍存在（來自 Auth metadata，不依賴 localStorage）
- 登出後 `userProfile` 為 `null`，LoginModal 正常觸發

## Impact

- 修改範圍：`src/types/auth.ts`（新建）、`src/types/card.ts`（re-export）、`src/context/AuthContext.tsx`（加 userProfile）、`src/app/profile/page.tsx`（初始化改源）
- 無 DB schema 變更
- `display_name` 編輯後的持久化仍使用 `localStorage.setItem`（本 change 只改**讀取**來源，不改寫入）
- 開發環境 mock user 已包含 `user_metadata.full_name`，dev 環境行為不變

## novelty claim（可偽證）

本 change 新意 = 從 Supabase Auth `user_metadata` 衍生 `UserProfile` 並通過 `useAuth()` hook 提供給所有消費者；若 `AuthContext.tsx` 仍需 localStorage 作為 `display_name` 的唯一持久化來源，則為假。

## 最近鄰 prior work

- REF-003（Google OAuth PKCE）：確立登入機制，user_metadata 在此時產生，但未被前端消費
- REF-005（app_metadata/developer role）：同樣讀取 JWT，但讀 app_metadata（不同欄位）
- ADR-03（AuthContext at layout + useAuth hook）：本 change 的架構基礎——AuthContext 是唯一 auth 狀態源
