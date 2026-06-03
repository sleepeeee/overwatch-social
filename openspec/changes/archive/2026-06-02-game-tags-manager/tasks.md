## 1. 資料庫建置與 Migration

- [x] 1.1 建立 Supabase Migration 檔案：在 `supabase/migrations/` 下新增 `006_game_tags.sql`，建立 `game_special_tags` 表並啟用 RLS。
- [x] 1.2 設定 RLS 政策：實作「公開讀取 (SELECT)」與「開發者寫入與刪除 (INSERT/DELETE)」的 RLS policies。
- [x] 1.3 寫入初始鬥陣特攻標籤：在 migration 中 INSERT 原有 `mockPlayers.ts` 中的 10 個 `PRESET_TAGS` 做為 Overwatch 的初始特色標籤資料。

## 2. 標籤維護 API (Server Actions)

- [x] 2.1 建立 `src/app/actions/tags.ts`：
  - 實作 `getGameTags(game: string)` 用於公開讀取標籤。
  - 實作 `addGameTag(game: string, tag: string)` 用於新增標籤（帶有 `ensureDeveloper()` 權限校驗）。
  - 實作 `deleteGameTag(id: number)` 用於物理刪除標籤（帶有 `ensureDeveloper()` 權限校驗）。

## 3. 開發者主控台「標籤管理」分頁

- [x] 3.1 修改 `src/app/developer/DeveloperConsoleClient.tsx`：
  - 在左側 Sidebar 中新增一個「標籤管理 (Tags)」的 Tab 按鈕，並在 Tab 狀態中加入對應的條件渲染。
  - 實作標籤管理 UI 面板：頂部為切換遊戲的選單（目前含「鬥陣特攻」），中部為新增標籤表單，下部以 Badge Grid 渲染所有標籤並在右側附帶「刪除 ❌」按鈕。
  - 串接 `getGameTags`，`addGameTag` 及 `deleteGameTag`，完成即時刷新與狀態顯示。

## 4. 個人檔案編輯頁面動態整合

- [x] 4.1 修改 `src/app/profile/page.tsx`：
  - 於初始化加載時，非同步調用 `getGameTags('Overwatch')` 拉取標籤。
  - 更新特色標籤狀態：若拉取成功，將其作為可選標籤列表；若失敗，則使用靜態 `PRESET_TAGS` 做為 Fallback。
  - 調整特色標籤 UI（比照 rf.png 截圖）：加上「已選 X / 3」文字與貼圖風格按鈕，並在點選第 4 個標籤時，實作彈出錯誤警告阻斷，限制最多選取 3 個特色標籤。

## 5. 整合驗證

- [ ] 5.1 測試後台標籤新增與刪除：以開發者帳號登入，在後台新增一個測試標籤（如 `#午餐吃水餃`），再將其刪除，確保 RLS 與 API 順利執行。
- [ ] 5.2 測試前台名片動態渲染：後台新增標籤後，在個人檔案頁面確認能選到該新增標籤；儲存後確認廣場卡片能即時反應該標籤文字。
