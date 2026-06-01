# 任務清單：開發者控制台與 UI 精緻化微調 (Developer Console & UI Refinements)

此清單依照優先級與系統相依性排列。請遵循「寫測試 -> 最小實作 -> 重構 -> 驗證」的步驟來推動任務。

---

## 🟥 P1：核心 UI 精緻化 (優先處理)

- [x] **Task 1.1: 調整名片語音圖示位置 (OWCard.tsx)**
  - [x] 移除左側語言展示容器中的 `border-l` 與語音圖示展示邏輯。
  - [x] 擴展左側語言列表的最大寬度限制（手機版設為 `max-w-[140px]`，網頁版設為 `max-w-[170px]`）。
  - [x] 在右側 MBTI 標籤左側新增一個語音狀態膠囊 (Mic Status Pill)。
  - [x] 根據 `mic_status` 分流渲染三種視覺配色（可開麥、僅聽麥、不用麥）。
  - [x] 確保在不同語言字數下，卡片底部排版皆對齊且不會有任何重疊或擠壓。

- [x] **Task 1.2: 精簡底部導覽列 (FloatingDock.tsx)**
  - [x] 完全刪除包含 `lotus` 的水印 `div` 區塊。
  - [x] 移除 `navItems` 陣列中的對準儀 (adjuster) 配置。
  - [x] 將導覽標籤更名（「廣場」 -> 「名片廣場」，「特工」 -> 「個人檔案」）。
  - [x] 調整 `gap` 排版間距（可嘗試改為 `gap-5` 或 `gap-6`），使 3 顆按鈕更加大方舒展。
  - [x] 在手機端與桌面端實測導覽列之定位與滑過氣泡，確保功能運作正常。

---

## 🟨 P2：開發者白名單與安全驗證

- [x] **Task 2.1: 撰寫 Supabase Database Migration SQL**
  - [x] 建立 `developer_whitelist` 白名單資料表，以 `email` 為 PRIMARY KEY。
  - [x] 啟用該表的 RLS，並建立權限政策：僅具有 `role = 'developer'` 的用戶有存取權限。
  - [x] 撰寫 `handle_developer_role_sync` 的 Postgres Trigger 函數，實現註冊/登入時比對 email 並指派 role 的邏輯。
  - [x] 建立 Trigger 連結到 `auth.users` 表的 `BEFORE INSERT OR UPDATE`。

- [x] **Task 2.2: 測試資料庫同步機制**
  - [x] 透過 SQL 編輯器在 `developer_whitelist` 中插入一個測試用 email（如當前開發者的 Google 帳號 email）。
  - [x] 使用該帳號進行登入，驗證其 `auth.users` 的 `raw_app_meta_data -> role` 是否成功被 Trigger 自動更新為 `"developer"`。
  - [x] 使用非白名單 email 帳號登入，驗證其 `app_metadata` 是否不包含 `"developer"` role。

---

## 🟩 P3：開發者控制台與功能移轉

- [x] **Task 3.1: 建立後台頁面與伺服器端路由阻斷**
  - [x] 建立獨立路由 `/developer` (檔案 `src/app/developer/page.tsx`)。
  - [x] 在該頁面的伺服器端 (Server Side Component) 利用 Supabase 伺服器 SDK 的 `getUser()` 解析使用者的 `app_metadata`。
  - [x] 驗證若角色非 `'developer'`，則直接使用 Next.js 的 `redirect("/")` 進行阻斷，防止非法進入。
  - [x] 設計 Developer Console 頁面版面，提供簡約、高科技感的 Tab 切換版面。

- [x] **Task 3.2: 移轉精密對準儀功能**
  - [x] 將原本 `src/app/adjuster/page.tsx` 的程式碼無縫遷移至 `/developer/adjuster` 下，或者以 Tab 元件的形式直接嵌入在 `/developer/page.tsx` 中。
  - [x] 徹底刪除原本的 `src/app/adjuster/page.tsx`。
  - [x] 檢查並更新對準儀所有相關的 React import，確保路徑正確。
  - [x] 於 `src/app/actions/saveAlignment.ts`（對齊參數寫入 API/Action）中最頂端加入 Server-side 的開發者 Role 安全檢驗。

- [x] **Task 3.3: 開發者控制台入口按鈕控制**
  - [x] 在個人檔案頁面 `src/app/profile/page.tsx` 中，使用 `useDevMode` 監聽開發者狀態。
  - [x] 若 `isDeveloper` 為 true，在頁面的合適位置（例如標題旁或管理區域）顯示一個精緻的「進入開發者後台`(/developer)`」按鈕。
  - [x] 若為一般用戶，則完全隱藏此入口按鈕。
  - [x] 進行全系統整合測試，確保權限隔離毫無漏洞。
