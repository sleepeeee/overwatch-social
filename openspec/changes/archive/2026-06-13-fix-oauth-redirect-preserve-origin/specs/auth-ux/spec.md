# auth-ux Specification Delta

## ADDED Requirements

### Requirement: OAuth 登入完成後保留來源頁面

系統 SHALL 在使用者從任一登入入口完成 Google OAuth 後，將其導回原本所在頁面（**而非一律導向 `/profile`**），以維持探索脈絡。實作 SHALL 透過 `src/lib/auth/googleLogin.ts` 集中提供的 `signInWithGoogle()` helper，於 `redirectTo` 帶入 `?next=<encoded current path>`，並由 `src/app/auth/callback/route.ts` 既有 `safeRedirectPath()` 驗證後 redirect。

`signInWithGoogle()` SHALL 過濾 unsafe `next` 前綴 `/auth/`、`/developer/`，遇此前綴 fallback 為 `/profile`，以避免 callback 迴圈或被丟去守門路由。

callback 端 `safeRedirectPath()` 既有的同源驗證、protocol-relative 阻擋、URL parse 失敗 fallback `/` 等防護 SHALL 保留（深度防禦），不因此 change 而移除或鬆綁。

#### Scenario: 從展示館點玩家卡觸發 LoginModal 登入

- **GIVEN** 使用者未登入，正在 `/browse?query=foo` 瀏覽
- **WHEN** 使用者點玩家卡的複製 UID 觸發 `LoginModal`，並在 modal 內點 Google 登入按鈕
- **THEN** 系統 SHALL 呼叫 `signInWithGoogle()`，其組出的 `redirectTo` SHALL 為 `${origin}/auth/callback?next=${encodeURIComponent('/browse?query=foo')}`
- **AND** Google 授權完成後，callback SHALL 將使用者導回 `/browse?query=foo`
- **AND** 系統 SHALL NOT 將使用者導向 `/profile`

#### Scenario: 從首頁 starmap 登入

- **GIVEN** 使用者未登入，正在 `/`，點雲朵展開 starmap 後點 Google 登入
- **WHEN** Google OAuth 完成
- **THEN** callback SHALL 將使用者導回 `/`

#### Scenario: 從工作室守門面板登入

- **GIVEN** 使用者未登入，訪問 `/profile`，看到守門面板
- **WHEN** 使用者點「Continue with Google」按鈕並完成 OAuth
- **THEN** callback SHALL 將使用者導回 `/profile`（行為與 fallback 巧合一致，但路徑來自顯式 `next` 而非預設）

#### Scenario: unsafe prefix 過濾

- **WHEN** `signInWithGoogle()` 被呼叫時 `window.location.pathname` 以 `/auth/` 或 `/developer/` 開頭
- **THEN** helper SHALL 將 `next` 設為 `/profile`（不寫入當前 unsafe 路徑）
- **AND** Google OAuth 完成後使用者 SHALL 被導向 `/profile`

#### Scenario: callback 端同源防護仍然有效

- **WHEN** 使用者點擊惡意連結被誘導觸發登入，且 `next` 參數被竄改為跨 origin URL（如 `https://evil.example/`）
- **THEN** `safeRedirectPath()` 既有的 `url.origin === origin` 檢查 SHALL 拒絕該 next
- **AND** 系統 SHALL fallback 導向 `/`

---

## MODIFIED Requirements

### Requirement: `LoginModal` 元件可在需要登入的互動點彈出

系統 SHALL 提供一個可重用的 `LoginModal` 元件，在未登入用戶嘗試需要登入的互動時出現。

#### Scenario: OWCard 複製 UID 觸發 LoginModal

- **GIVEN** 使用者未登入，在名片廣場瀏覽名片
- **WHEN** 使用者點擊任一 OWCard 的複製 UID 按鈕
- **THEN** 系統 SHALL 顯示 `LoginModal`（居中彈窗，backdrop 模糊）
- **AND** LoginModal SHALL 顯示 Google 登入按鈕
- **AND** LoginModal SHALL 可被關閉（點 × 或 backdrop）
- **AND** 系統 SHALL NOT 再顯示原本的靜態紅字提示「⚠️ 請先登入帳號」

#### Scenario: LoginModal 彈窗登入

- **WHEN** 使用者在 LoginModal 內點擊 Google 登入按鈕
- **THEN** 系統 SHALL 呼叫 `signInWithGoogle()`（`src/lib/auth/googleLogin.ts`），由 helper 組出含 `?next=<encoded current path>` 的 `redirectTo` 並呼叫 `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`
- **AND** 瀏覽器 SHALL 跳轉至 Google 授權頁
- **AND** `redirectTo` SHALL NOT 直接寫死 `${origin}/auth/callback`（不帶 next）形式

#### Scenario: LoginModal 不產生 hydration mismatch

- **WHEN** `LoginModal` 的 `show` prop 為 `false`
- **THEN** 元件 SHALL return `null`（不渲染任何 DOM）
