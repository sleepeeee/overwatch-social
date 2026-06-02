# auth Specification

## Purpose
TBD - created by archiving change google-oauth-supabase-auth. Update Purpose after archive.
## Requirements
### Requirement: Google OAuth 登入
系統 SHALL 提供 Google OAuth 登入，使用 Supabase Auth 的 PKCE flow，並透過自家 `/auth/callback` route 以 `exchangeCodeForSession` 取得 session。

#### Scenario: 使用者透過 Google 成功登入
- **WHEN** 未登入使用者點選登入並完成 Google 同意畫面
- **THEN** 系統 SHALL 透過 `/auth/callback` 將授權碼換成 session 並寫入 cookie
- **AND** 將使用者導向 `/profile`

#### Scenario: OAuth 授權碼交換失敗
- **WHEN** `/auth/callback` 收到的 code 無法換成 session
- **THEN** 系統 SHALL 將使用者導向錯誤頁，不建立任何 session

#### Scenario: callback next 參數防 open redirect [修正 Major]
- **WHEN** `/auth/callback` 收到 `next` query 參數
- **THEN** 系統 SHALL 驗證 `next` 必須為相對路徑（以 `/` 開頭，不含 `//` 或 `://`）
- **AND** 若驗證失敗，SHALL fallback 至 `/`，不跟隨外部 URL

### Requirement: Server 端 session 驗證
系統在 server 端（Server Component / Action / Route Handler）SHALL 一律使用 `getClaims()` 驗證身分，MUST NOT 以 `getSession()` 作為授權依據。

#### Scenario: 受保護動作的身分檢查
- **WHEN** 後端執行寫入 profile 的 Server Action
- **THEN** 系統 SHALL 以 `getClaims()` 取得並驗證 user id
- **AND** 若無有效身分則拒絕寫入

### Requirement: Session token 自動刷新
系統 SHALL 透過 `src/middleware.ts` 在每次請求刷新 Supabase session token，並將更新後的 cookie 同時寫回 request 與 response。

#### Scenario: 登入態跨頁面維持
- **WHEN** 已登入使用者於 token 接近過期時導航至任一頁面
- **THEN** middleware SHALL 刷新 token 並維持登入態，Server Component 可讀到有效身分

### Requirement: 登出
系統 SHALL 提供登出，清除 Supabase session。

#### Scenario: 使用者登出
- **WHEN** 已登入使用者點選登出
- **THEN** 系統 SHALL 清除 session cookie 並更新 UI 為未登入狀態

### Requirement: 首頁 Google 登入入口必須觸發真實 OAuth 流程

首頁（`page.tsx`）的「使用 Google 登入」按鈕 SHALL 觸發 Supabase `signInWithOAuth` PKCE flow，而非顯示佔位 alert。

#### Scenario: 一般使用者從首頁點 Google 登入

- **WHEN** 未登入使用者在首頁點擊「使用 Google 登入」按鈕
- **THEN** 系統 SHALL 呼叫 `supabase.auth.signInWithOAuth({ provider: 'google' })` 並帶 `redirectTo` 指向 `/auth/callback?next=/profile`
- **AND** 瀏覽器 SHALL 跳轉至 Google 授權頁
- **AND** 系統 SHALL NOT 顯示任何 `alert` 佔位訊息

### Requirement: 側邊欄登出入口必須執行真實 session 清除

側邊欄（`AppSidebar.tsx`）的 LOGOUT 按鈕 SHALL 呼叫 `supabase.auth.signOut` 清除 session，而非顯示佔位 alert。

#### Scenario: 已登入使用者從側邊欄登出（前提：AppSidebar 已掛載）

- **GIVEN** `AppSidebar` 元件已被掛載於某 page/layout 且處於 router context（現狀未掛載——此 scenario 在掛載前為 latent，須記入跳過項目表）
- **WHEN** 已登入使用者點擊側邊欄 LOGOUT 按鈕
- **THEN** 系統 SHALL 呼叫 `supabase.auth.signOut()`
- **AND** 系統 SHALL 呼叫 `router.refresh()` 使 Server Component 重新讀取已清除的 session
- **AND** 系統 SHALL NOT 顯示任何 `alert` 佔位訊息

### Requirement: 開發者模式依不可偽造的 app_metadata 角色顯示

系統 SHALL 依 `user.app_metadata.role === 'developer'` 判定開發者身分，並僅對開發者顯示開發者模式 banner。判定來源 SHALL 為 JWT 內建的 `app_metadata`，使用者無法自行偽造。

#### Scenario: 開發者登入後顯示 dev mode banner

- **WHEN** `app_metadata.role` 為 `'developer'` 的使用者登入後載入任一頁面
- **THEN** `useDevMode()` SHALL 回傳 `{ isDeveloper: true }`
- **AND** `DevModeBanner` SHALL 被渲染

#### Scenario: 一般使用者登入後不顯示 dev mode banner

- **WHEN** `app_metadata.role` 不為 `'developer'`（含 `undefined`）的使用者登入後載入任一頁面
- **THEN** `useDevMode()` SHALL 回傳 `{ isDeveloper: false }`
- **AND** `DevModeBanner` SHALL render `null`

#### Scenario: 未登入狀態不顯示 dev mode banner

- **WHEN** 無登入 session 的訪客載入任一頁面
- **THEN** `useDevMode()` SHALL 回傳 `{ isDeveloper: false }`
- **AND** `DevModeBanner` SHALL render `null`

#### Scenario: 角色解析未完成時 banner 不渲染（hydration 安全）

- **WHEN** 頁面首次載入、`useDevMode()` 的非同步 `getUser()` 尚未解析（`loading === true`）
- **THEN** `DevModeBanner` SHALL render `null`（SSR 與 client hydration 首 render 一致）
- **AND** 系統 SHALL NOT 產生 hydration mismatch 警告（REF-006）

#### Scenario: app_metadata 設定後在舊 JWT 有效期內不立即生效

- **WHEN** 管理者剛在 Supabase 對某 email 設定 `role: developer`，但該使用者的現有 JWT 尚未到期或刷新
- **THEN** 系統 SHALL 仍依舊 JWT 判定（banner 暫不顯示）
- **AND** 文件 SHALL 註明使用者須重新登入或等待 token 刷新後生效

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

### Requirement: TopBar 開發者後台按鈕與權限控制
TopBar 元件 SHALL 根據使用者的 Google 登入狀態及開發者權限，動態顯示入口按鈕。原本的「我的名片」按鈕 SHALL 移除，改由「開發者後台」按鈕取代，且只有經後端資料庫白名單同步後擁有 `developer` 角色的使用者才能看見該按鈕。

#### Scenario: 開發者登入後在 TopBar 顯示開發者後台按鈕
- **WHEN** 使用者已登入，且 `useDevMode()` 回傳之 `isDeveloper` 為 `true`
- **THEN** TopBar SHALL 顯示「開發者後台」按鈕，指向 `/developer`
- **AND** 系統 SHALL NOT 顯示「我的名片」按鈕

#### Scenario: 一般使用者登入後在 TopBar 不顯示開發者後台與我的名片按鈕
- **WHEN** 使用者已登入，且 `useDevMode()` 回傳之 `isDeveloper` 為 `false`
- **THEN** TopBar SHALL NOT 顯示「開發者後台」按鈕
- **AND** 系統 SHALL NOT 顯示「我的名片」按鈕，僅顯示「登出」按鈕

