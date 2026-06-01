## Context

在本地開發環境中，由於使用 Mock/Placeholder Supabase，用戶無法取得真實 `developer` 角色權限，導致無法進入開發者控制台（`/developer`）。此外，首頁的公告（站長隨筆手札）目前寫死在元件中。本設計旨在本地開發模式下提供身分豁免，並建立本機 JSON 持久化的首頁編輯器。

## Goals / Non-Goals

**Goals:**
- 在開發環境下，使 `useDevMode` 和 `/developer/page.tsx` 自動豁免身分驗證，便於本地訪問與測試。
- 實現後台直接編輯首頁的 4 筆公告（站長隨筆手札、最新改版日誌、加入玩家語音、請站長喝杯咖啡）的完整表單。
- 透過 Server Action 將公告資料持久化寫入本機 `src/data/announcements.json`。
- 首頁 `LotusWelcomeWidget` 改為動態載入該 JSON。

**Non-Goals:**
- 不改變生產環境（Production）下的 Supabase 權限驗證逻辑。
- 不改變公告原本的動態切換與視覺樣式（僅更換其資料來源與後台編輯）。

## Decisions

### 1. 開發模式身分繞過 (Dev Mode Bypass)
- **前端 `useDevMode.ts`**：
  ```typescript
  if (process.env.NODE_ENV === "development") {
    setState({ isDeveloper: true, loading: false });
    return;
  }
  ```
- **伺服器端 `/developer/page.tsx`**：
  ```typescript
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev && user?.app_metadata?.role !== "developer") {
    redirect("/");
  }
  ```

### 2. 建立首頁編輯 Server Actions (`src/app/actions/homepage.ts`)
- **功能**：
  - `getAnnouncements()`：讀取 `src/data/announcements.json`。若檔案不存在，則讀取預設公告資料。
  - `saveAnnouncements(data)`：將新公告資料寫入該 JSON。如果在生產環境（`process.env.NODE_ENV !== "development"`），則呼叫 `ensureDeveloper()` 進行 Supabase 角色驗證。

### 3. 公告資料結構與 JSON 持久化 (`src/data/announcements.json`)
- 新增 `src/data/announcements.json` 檔案。
- 當站長於後台點選「儲存」時，直接寫入本機 JSON 檔案。

### 4. 側邊欄編輯器 Tab 與表單設計
- 在 `DeveloperConsoleClient.tsx` 中，加入 `activeTab === "editor"`。
- 表單提供 4 筆公告的輸入欄位（Tag、Title、Message），並提供一個統一的「💾 儲存並更新首頁」按鈕。

## Risks / Trade-offs

- **[Risk] 本地 JSON 寫入在 Serverless 環境可能無法持久** → **[Mitigation]** 此小站目前主要運行在本地開發環境或具有檔案寫入權限的 VPS 虛擬機上。對於此種架構，本地 JSON 讀寫可完全避開 Supabase 連線限制，極度便於測試。在 Serverless 生產環境中，若需要分散式持久化，後續可再無縫擴展成 Supabase DB 儲存。
