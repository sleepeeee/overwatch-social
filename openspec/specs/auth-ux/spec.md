# auth-ux Specification

## Purpose
TBD - created by archiving change auth-ux-login-gate. Update Purpose after archive.
## Requirements
### Requirement: 已登入用戶在首頁可以登出

首頁（`page.tsx`）已登入狀態下，SHALL 在右上角顯示「登出」按鈕，與「我的名片」連結並排，視覺風格一體。

#### Scenario: 已登入用戶在首頁點登出

- **GIVEN** 使用者已完成 Google OAuth 登入，首頁右上角顯示「我的名片」
- **WHEN** 使用者點擊「登出」按鈕
- **THEN** 系統 SHALL 呼叫 `supabase.auth.signOut()`
- **AND** 右上角 SHALL 切換回「使用 Google 登入」按鈕（透過 `onAuthStateChange` 自動響應）
- **AND** 系統 SHALL 呼叫 `router.refresh()`（防止 Next.js RSC fetch cache 保留舊 session）

---

### Requirement: `/profile` 頁面對未登入用戶顯示登入引導

`/profile` 頁面 SHALL 在未登入狀態下以 overlay 引導登入，而非允許無效的編輯操作。

#### Scenario: 未登入用戶訪問 /profile

- **GIVEN** 使用者未登入，直接訪問 `/profile`
- **WHEN** 頁面 hydration 完成（`isMounted === true`）且 auth 解析完成（`user === null`）
- **THEN** 頁面 SHALL 在主體上顯示 `LoginModal`（`show=true`，不可關閉）
- **AND** LoginModal SHALL 顯示「登入後才能建立名片」說明文字
- **AND** LoginModal SHALL 顯示 Google 登入按鈕
- **AND** 頁面 SHALL NOT 允許用戶與表單互動（overlay 蓋住整個頁面）
- **NOTE**：auth 解析期間（`authLoading=true`，約 100-500ms）overlay 尚未顯示，此為 client-only guard 的固有限制，已在 design.md D2「已知限制」段明確文件化

#### Scenario: overlay 不因 hydration 閃現

- **WHEN** `/profile` 頁面 SSR → client hydration 過程中
- **THEN** overlay SHALL NOT 在 `isMounted === false` 時渲染（兩端一致 → 無 hydration mismatch）

---

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
- **THEN** 系統 SHALL 呼叫 `signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })`
- **AND** 瀏覽器 SHALL 跳轉至 Google 授權頁

#### Scenario: LoginModal 不產生 hydration mismatch

- **WHEN** `LoginModal` 的 `show` prop 為 `false`
- **THEN** 元件 SHALL return `null`（不渲染任何 DOM）

---

### Requirement: OWCard 提供 onLoginRequired callback

`OWCard` 元件 SHALL 支援 `onLoginRequired` 可選 prop，使父元件可控制未登入時的引導行為。

#### Scenario: onLoginRequired 未提供時的行為

- **WHEN** OWCard 使用時未提供 `onLoginRequired` prop
- **THEN** 點複製按鈕未登入時 SHALL 靜默（`onLoginRequired?.()` 為 no-op）
- **AND** 系統 SHALL NOT 顯示任何舊的 `copiedTagError` 紅字（移除舊行為）

