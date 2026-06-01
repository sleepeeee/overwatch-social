## ADDED Requirements

### Requirement: 全域 AuthContext 單一訂閱
系統 **SHALL** 透過單一 `AuthProvider`（Client Component）在 `layout.tsx` 層管理 Supabase auth state，且整個 app 執行期間 **MUST** 只存在一個 `onAuthStateChange` 訂閱。

#### Scenario: 所有頁面共享同一 auth state
- **WHEN** 使用者在任何頁面（`/`、`/browse`、`/profile`）與 app 互動
- **THEN** TopBar、profile 頁、browse 頁均從同一 `AuthProvider` 取得 `user` 與 `authLoading`
- **AND** 不存在任何頁面級別的獨立 `onAuthStateChange` 訂閱

---

### Requirement: AuthProvider 提供 useAuth hook
系統 **SHALL** 提供 `useAuth()` hook，回傳 `{ user: User | null, authLoading: boolean }`，供所有 Client Component 消費 auth state。

#### Scenario: 未登入狀態的 authLoading 初始值
- **WHEN** AuthProvider 完成初始化（`getUser()` 回傳）
- **THEN** `authLoading` 設為 `false`
- **AND** `user` 設為 `null`（未登入）或有效 `User` 物件（已登入）

#### Scenario: hydration 期間不顯示 LoginModal
- **WHEN** AuthProvider 尚未完成 `getUser()` 呼叫
- **THEN** `authLoading` 為 `true`
- **AND** profile 頁的 LoginModal `show={!authLoading && !user}` 評估為 `false`（不顯示）

## MODIFIED Requirements

### Requirement: TopBar 登入狀態顯示（原 auth-topbar-unification）
系統 **SHALL** 在三頁右上角顯示統一的 TopBar，**MODIFIED** 為：TopBar **MUST** 使用 `useAuth()` 取得 user state，而非自行建立 Supabase 訂閱。

#### Scenario: TopBar 無本地 auth 訂閱
- **WHEN** TopBar 元件 mount
- **THEN** TopBar 呼叫 `useAuth()` 取得 `user`
- **AND** TopBar 不建立任何 `onAuthStateChange` 訂閱
- **AND** Google 登入按鈕與登出按鈕功能不變
