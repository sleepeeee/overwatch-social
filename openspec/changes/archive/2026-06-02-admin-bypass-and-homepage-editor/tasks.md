## 1. 開發環境 Bypass 權限修復

- [x] 1.1 修改 `src/hooks/useDevMode.ts`，在開發環境下直接返回 `isDeveloper = true`
- [x] 1.2 修改 `src/app/developer/page.tsx`，在開發環境下放寬重定向限制，允許直接存取 `/developer` 路由

## 2. 首頁編輯器 Server Action 與資料初始化

- [x] 2.1 建立首頁預設公告設定檔 `src/data/announcements.json`
- [x] 2.2 新增 `src/app/actions/homepage.ts`，實作本地讀寫 announcements.json 的 Server Actions

## 3. 首頁與後台編輯介面重構

- [x] 3.1 修改 `src/components/morning-sketch/LotusWelcomeWidget.tsx`，使其改為透過 Server Action 動態載入最新公告
- [x] 3.2 修改 `src/app/developer/DeveloperConsoleClient.tsx`，於側邊欄新增首頁編輯 Tab，並繪製 4 筆公告編輯表單與儲存按鈕

## 4. 驗證與品質控制

- [x] 4.1 測試從個人檔案主控台點選「開發者後台」按鈕，確認能順利進入，且能在後台編輯公告並更新首頁內容
- [x] 4.2 執行 TypeScript 類型檢查與 ESLint 單檔檢查確保程式碼品質
