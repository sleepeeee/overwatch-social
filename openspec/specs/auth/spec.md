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

