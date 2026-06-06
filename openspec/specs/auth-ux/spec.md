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
`/profile` 頁面 **SHALL** 在未登入狀態下以 overlay 引導登入，且 **MUST** 引入 `mounted` 狀態在 `useEffect` 後載入條件分支，以防伺服器端（SSR）與客戶端（client-side）渲染 DOM 不一致引起水合（Hydration mismatch）錯誤。

#### Scenario: 未登入用戶訪問 /profile
- **GIVEN** 使用者未登入，直接訪問 `/profile`
- **WHEN** 頁面載入且 `mounted === true`（在 `useEffect` 內設為 true）
- **THEN** 頁面 **SHALL** 渲染 `🔒 鎖定頁面`，包含「進入全域身份工作室」說明文字與 Google 登入按鈕
- **AND** 頁面 **SHALL NOT** 在伺服器端預先判斷 `user` 渲染鎖定狀態（在 `mounted === false` 時 return 空骨架或 loading），以防 Hydration mismatch 錯誤

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

### Requirement: 首頁全域身份工作室入口整合 Google 快速登入 (Homepage Google Login Integration)
系統在首頁（`page.tsx`）的「全域身份工作室」入口卡片底部，**SHALL** 根據 `useAuth` 的登入狀態顯示快速登入入口：
- 未登入時：顯示 `Continue with Google` 快速登入按鈕。
- 已登入時：顯示 `已同步 GOOGLE 雲端資料` 綠色已對接狀態條。
此按鈕 **MUST** 使用 `e.stopPropagation()` 以防點擊時觸發外層的卡片點擊跳轉事件。

#### Scenario: 未登入使用者在首頁快速對接 Google 帳號
- **GIVEN** 使用者尚未登入
- **WHEN** 使用者在首頁「全域身份工作室」卡片中點擊 `Continue with Google` 按鈕
- **THEN** 系統阻止事件冒泡至外層跳轉連結，並觸發 `supabase.auth.signInWithOAuth` 呼叫跳轉至 Google 授權頁

