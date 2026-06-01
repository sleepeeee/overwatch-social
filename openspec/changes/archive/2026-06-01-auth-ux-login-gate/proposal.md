# Proposal: auth-ux-login-gate

## Why

`auth-fix-and-developer-role` change 完成了 Google OAuth 登入基礎設施（PKCE flow、callback route、app_metadata 角色系統），使登入機制真正可用。但 UX 層存在三個明顯斷裂點，讓「已可用的 auth」對使用者而言仍像不存在：

1. **整站無登出按鈕**：`Navbar.tsx` / `AppSidebar.tsx` 雖有完整的登入/登出邏輯，但兩者皆未被任何 layout/page 掛載（dead components）。`FloatingDock` 是唯一全局導航，但無任何 auth 感知。首頁 `page.tsx` 登入後顯示「我的名片」Link，但旁邊沒有登出——使用者無法登出。

2. **`/profile` 無登入守門**：未登入用戶可以進入並「編輯」DEFAULT_CARD，點儲存才看到文字提示「請先登入」。體驗語境不連貫——沒有任何入口引導用戶先登入。

3. **OWCard 互動未引導**：未登入用戶點複製 UID 只見小紅字「⚠️ 請先登入帳號」，沒有可點擊的登入入口，使用者不知道該去哪裡登入。

**缺口錨定**：最近鄰 prior work = `auth-fix-and-developer-role`（REF-002 client 分層、REF-003 PKCE flow）。那個 change 把 auth 機制做對了；本 change 針對的具體空白 = UX 引導層（呼叫 `signInWithOAuth` 的入口點分散且不完整）。

**Why Now**：誠實降級為「內部排序」——無外部技術觸發或競爭窗口。但以下條件使現在是最低成本的修復時機：
- (a) auth 基礎設施剛在 1 天前落地，client 分層與 callback 邏輯的 context 仍新鮮，改動成本最低
- (b) 開發者後台（`developer-console-and-ui-tweaks`）已上線，開發者本人每次登出都需要重開瀏覽器——緊迫性已存在
- (c) 下一個計畫的 `developer-console-backend` change 需要用戶能穩定登入/登出才能測試

## What Changes

- **`src/app/page.tsx`**：登入後右上角改為 `[我的名片] [登出]` 兩按鈕並排，同圓角 / 同邊框 / 同高度一體視覺
- **`src/app/profile/page.tsx`**：未登入時在頁面主體上蓋半透明 overlay，含「登入後才能建立名片」說明 + Google 登入按鈕；已登入正常顯示
- **`src/components/LoginModal.tsx`**（新建）：居中彈窗元件，含 backdrop、Google 登入按鈕、× 關閉；hydration safe（loading guard）
- **`src/components/OWCard.tsx`**：新增 `onLoginRequired?: () => void` prop，點複製未登入時呼叫 callback 而非只顯示靜態紅字
- **`src/app/browse/page.tsx`**：加 `showLoginModal` state + 掛載 `LoginModal`，傳 `onLoginRequired` 給每張 OWCard

## Non-Goals

- 不做 middleware 層 route protection（`/profile` 直接 redirect）
- **FloatingDock 的 auth 感知改造推遲至下一個 change `nav-auth-integration`**（M1：首頁右上角的 [登出] 是設計決策，非 workaround；FloatingDock 有複雜的 motion 設計需要獨立對待）
- 不處理 social_channels 複製的 auth guard（browse/page.tsx 在載入資料時已清空 social_channels，實際上不暴露）
- 不做「已登入後重定向回操作頁面」的複雜流程（登入後固定回 /auth/callback → /profile）
- **此 change 僅做前端 UI guard；`/api` 或 Server Action 層的 auth 保護不在範圍內，為已知技術債（m3）**

## 元件關係說明（M2）

**A2 的 `/profile` overlay 直接使用 A3 引入的 `<LoginModal>` 元件**（同一元件，不各自實作）。差異僅在於：A2 的 overlay 是 `<LoginModal>` 在 profile page 的 always-open 變體（`show=true` when `!user && isMounted`），可關閉性由 profile page 決定（不可關閉，因為整頁都需要登入）。

## Impact

- 使用者可以正常登出，auth 體驗閉環
- 未登入訪客嘗試互動時得到引導而非靜默失敗
- `profile/page.tsx` 編輯區的「請先登入才能儲存」錯誤文字可以移除（被 overlay 取代）
- 無破壞性變更：`Navbar.tsx` / `AppSidebar.tsx` 不動（保持 dead 但程式碼正確）
