## MODIFIED Requirements

### Requirement: `/profile` 頁面對未登入用戶顯示登入引導
`/profile` 頁面 **SHALL** 在未登入狀態下以 overlay 引導登入，且 **MUST** 引入 `mounted` 狀態在 `useEffect` 後載入條件分支，以防伺服器端（SSR）與客戶端（client-side）渲染 DOM 不一致引起水合（Hydration mismatch）錯誤。

#### Scenario: 未登入用戶訪問 /profile
- **GIVEN** 使用者未登入，直接訪問 `/profile`
- **WHEN** 頁面載入且 `mounted === true`（在 `useEffect` 內設為 true）
- **THEN** 頁面 **SHALL** 渲染 `🔒 鎖定頁面`，包含「進入全域身份工作室」說明文字與 Google 登入按鈕
- **AND** 頁面 **SHALL NOT** 在伺服器端預先判斷 `user` 渲染鎖定狀態（在 `mounted === false` 時 return 空骨架或 loading），以防 Hydration mismatch 錯誤

---

## ADDED Requirements

### Requirement: 首頁全域身份工作室入口整合 Google 快速登入 (Homepage Google Login Integration)
系統在首頁（`page.tsx`）的「全域身份工作室」入口卡片底部，**SHALL** 根據 `useAuth` 的登入狀態顯示快速登入入口：
- 未登入時：顯示 `Continue with Google` 快速登入按鈕。
- 已登入時：顯示 `已同步 GOOGLE 雲端資料` 綠色已對接狀態條。
此按鈕 **MUST** 使用 `e.stopPropagation()` 以防點擊時觸發外層的卡片點擊跳轉事件。

#### Scenario: 未登入使用者在首頁快速對接 Google 帳號
- **GIVEN** 使用者尚未登入
- **WHEN** 使用者在首頁「全域身份工作室」卡片中點擊 `Continue with Google` 按鈕
- **THEN** 系統阻止事件冒泡至外層跳轉連結，並觸發 `supabase.auth.signInWithOAuth` 呼叫跳轉至 Google 授權頁
