## Why

為了解決本地開發環境下（使用 Mock Supabase）無法正常登入或以 `developer` 角色存取開發者控制台的問題，並提供站長可以在後台動態修改首頁「站長隨筆手札」公告的便利功能，本變更旨在實作「開發模式下權限免驗證（Bypass）」與「本機 JSON 持久化的首頁編輯器」。

## What Changes

- **開發模式權限 Bypass**：
  - 在 `useDevMode` 前端 hook 中，若為 `NODE_ENV === "development"`，預設返回 `isDeveloper = true`。
  - 在 `/developer` 頁面伺服器端中，若為開發環境，放寬 `role === "developer"` 的重新導向限制。
- **首頁公告編輯器 (Homepage Editor)**：
  - 在 `/developer` 控制台側邊欄新增「首頁內容編輯」的 Tab。
  - 實作一組精美的表單，讓站長可以直接修改首頁的 4 筆公告資訊（包含 Tag, Title, Message）。
  - 新增 Server Actions 讀寫本機的 [src/data/announcements.json](file:///D:/AI/overwatch/overwatch-social/src/data/announcements.json) 以進行資料持久化。
  - 修改 `LotusWelcomeWidget.tsx`，改為在元件加載時動態載入最新被編輯的公告。

## Capabilities

### New Capabilities
- `admin-bypass-in-development`: 在本地開發環境下自動豁免開發者控制台之身分與權限驗證。
- `homepage-announcement-editor`: 在開發者控制台整合首頁公告編輯介面，並實作本地 JSON 檔案讀寫之 Server Actions。

### Modified Capabilities
<!-- 無 -->

## Impact

- 影響的檔案：
  - `src/hooks/useDevMode.ts`
  - `src/app/developer/page.tsx`
  - `src/app/developer/DeveloperConsoleClient.tsx`
  - `src/components/morning-sketch/LotusWelcomeWidget.tsx`
  - 新建 `src/app/actions/homepage.ts` (Server Actions)
  - 新建 `src/data/announcements.json` (公告設定檔)
