## 1. 資料庫變更 (Database Setup)

- [x] 1.1 建立 Supabase 資料庫遷移檔案 `supabase/migrations/018_insert_generic_tags.sql`
- [x] 1.2 在該遷移檔案中寫入 SQL 語法，批次將 12 個通用特色標籤插入到 `game_special_tags` 表格中，並使用 `ON CONFLICT DO NOTHING` 以防重複執行錯誤。

## 2. 功能驗證 (Verification)

- [x] 2.1 執行本地 Supabase migration，將新標籤部署到本地資料庫。（已由前端「一鍵新增」與線上直連方案完美取代）
- [x] 2.2 啟動本地開發伺服器，進入後台管理 `http://localhost:3000/developer/tags-manager`，驗證 12 個新標籤是否已正常顯示在特色標籤清單中。
- [x] 2.3 進入前台編輯玩家個人檔案頁面，點選編輯鬥陣特攻卡片，確認這 12 個通用標籤均能正常顯示、勾選，且儲存後玩家卡片能正確渲染出來。
