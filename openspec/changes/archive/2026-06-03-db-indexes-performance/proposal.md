## Why

browse 廣場所有查詢目前直打 PostgreSQL（透過 Supabase），`profiles` 資料表零索引。`ilike '%text%'` 搜尋是全表掃描，`ORDER BY updated_at DESC` 也缺索引。當用戶數超過數百時，每次廣場載入都觸發 Seq Scan，DB CPU 快速飽和。

## What Changes

- 新增 SQL migration `011_performance_indexes.sql`，安裝下列索引：
  - `pg_trgm` 擴充功能（支援 GIN trigram 索引）
  - `idx_profiles_battle_tag_trgm`：GIN trigram 索引，加速 `battle_tag ILIKE '%text%'`
  - `idx_profiles_message_trgm`：GIN trigram 索引，加速 `message ILIKE '%text%'`
  - `idx_profiles_updated_at_desc`：B-tree 索引，加速預設 `ORDER BY updated_at DESC`
  - `idx_profiles_server`：B-tree 索引，為 server eq filter 預備（Change 2 使用）
  - `idx_profiles_mic_status`：B-tree 索引，為 mic_status eq filter 預備（Change 2 使用）
  - `idx_profiles_updated_at_user_id`：複合索引，為未來 cursor pagination 預備

## Capabilities

### New Capabilities

- `db-performance-indexes`：為 `profiles` 資料表建立效能索引，使廣場搜尋與排序查詢從 Seq Scan 降為 Index Scan

### Modified Capabilities

（無需求層級變更：此 change 為純 DB 層優化，不影響任何現有 spec 的使用者可見行為）

## Impact

- **新增檔案**：`supabase/migrations/011_performance_indexes.sql`
- **資料庫**：`profiles` 資料表新增 6 個索引 + `pg_trgm` 擴充
- **App 程式碼**：零變更
- **Supabase 部署**：需在 Dashboard → SQL Editor 執行 migration，或透過 Supabase CLI `supabase db push`
- **依賴**：`pg_trgm` 在 Supabase 受管環境預設可用
