---
id: userprofile-auth-metadata-sync/auth-profile
type: spec
delta: replace
---

# Spec: auth-profile — AuthContext userProfile + UserProfile 型別遷移

## ADDED Requirements

### Requirement: UserProfile 型別集中於 types/auth.ts
系統 SHALL 在 `src/types/auth.ts` 定義 `UserProfile` interface，`src/types/card.ts` 改為 re-export。

#### Scenario: types/auth.ts 存在且包含 UserProfile
- WHEN `src/types/auth.ts` 存在
- THEN 包含 `export interface UserProfile { id: string; display_name: string; avatar_url: string; bio?: string; }`

#### Scenario: card.ts re-export 保持向後相容
- WHEN 其他檔案 `import { UserProfile } from "@/types/card"`
- THEN TypeScript 編譯通過（re-export 有效）

### Requirement: AuthContext 提供 userProfile
`AuthContext` SHALL 提供 `userProfile: UserProfile | null`，由 `user.user_metadata` 衍生。

#### Scenario: 登入後 userProfile 自動填充
- WHEN 使用者完成 Google OAuth 登入
- THEN `useAuth().userProfile.display_name` 等於 `user.user_metadata.full_name`（或 fallback）
- AND `useAuth().userProfile.avatar_url` 等於 `user.user_metadata.avatar_url`（或 fallback）

#### Scenario: fallback 鏈完整
- WHEN `user.user_metadata.full_name` 不存在
- THEN `display_name` fallback 至 `user_metadata.name ?? email.split("@")[0] ?? "特工"`
- WHEN `user.user_metadata.avatar_url` 不存在
- THEN `avatar_url` fallback 至 `user_metadata.picture ?? "/images/avatars/avatar_female_elegant_square.png"`

#### Scenario: 登出後 userProfile 為 null
- WHEN 使用者登出
- THEN `useAuth().userProfile` 為 `null`

#### Scenario: getUser + onAuthStateChange 兩條路徑均更新
- WHEN `getUser()` 回傳 user 或 `onAuthStateChange` 觸發
- THEN `userProfile` 均同步更新（不只依賴其中一條路徑）

## ADDED Requirements

### Requirement: profile/page.tsx userProfile 初始化改源
`profile/page.tsx` SHALL 從 `useAuth().userProfile` 初始化本地 `userProfile` state，取代 `localStorage.getItem("user_profile_hub")`。

#### Scenario: 登入後 profile 頁自動顯示 Google 帳號名稱
- WHEN 登入後訪問 `/profile`
- THEN 「通用帳戶暱稱」欄位自動填入 Google 帳戶 `full_name`（非「愛喝奶茶」預設值）

#### Scenario: 清除 localStorage 後名稱仍存在（Auth 作為 seed）
- WHEN 清除 localStorage 後重整 `/profile`
- THEN `display_name` 仍顯示 Google 帳戶名稱（`authUserProfile` 的 fallback seed 生效）

#### Scenario: localStorage 存在時手動改名不被 Auth 覆蓋（per-user key）
- WHEN 用戶手動修改 `display_name` 並儲存（localStorage `user_profile_hub_{userId}` 寫入成功）
- THEN 重整頁面後仍顯示用戶修改後的名稱（per-user localStorage 優先，Auth 不覆蓋）
- AND 不同 user 登入不會拿到前一個 user 的快取（key 含 user_id）

#### Scenario: 登出後 LoginModal 正常觸發
- WHEN 訪問 `/profile` 且已登出（`user = null`）
- THEN LoginModal 顯示（`userProfile` 為 null，頁面正確判斷未登入）

#### Scenario: useEffect 依 authUserProfile object 觸發（含 metadata 更新）
- WHEN `authUserProfile` 從 `null` 變為有值，或 metadata 更新（同一用戶）
- THEN 重新評估是否 seed：若 localStorage 已存在則保留用戶修改，否則使用 authUserProfile
- AND 依賴 `[authUserProfile]` 整個物件（非 `?.id`），確保 metadata 變更時重新評估
