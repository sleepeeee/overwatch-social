## Context

`profiles` 資料表（migration 001）目前只有 primary key `user_id`，無其他索引。廣場（browse）查詢走 `public_profiles` view（regular view，非 materialized），PostgreSQL planner 在 view 後追蹤到 base table 時可使用 base table 上的索引。

查詢熱路徑：
1. `ORDER BY updated_at DESC LIMIT 20`（預設排序，每次頁面載入）
2. `battle_tag ILIKE '%text%' OR message ILIKE '%text%' OR mbti ILIKE '%text%'`（搜尋）

兩條路徑目前皆是 Seq Scan，隨 `profiles` 資料量線性惡化。

## Goals / Non-Goals

**Goals:**
- 消除 browse 預設載入的 Seq Scan（ORDER BY updated_at）
- 消除 ILIKE 搜尋的 Seq Scan（battle_tag、message）
- 預建 server / mic_status 的 eq filter 索引，供 Change 2（browse-db-filter）使用
- 預建複合索引，供未來 cursor pagination 使用
- 零 app 程式碼變更

**Non-Goals:**
- 不處理 `selected_heroes`（text[] array）的索引（role filter 仍在 client-side）
- 不引入 Materialized View（另立 change 評估）
- 不改動 RLS policies 或 view 定義

## Decisions

### 決策 1：使用 pg_trgm GIN 索引而非 Full-Text Search（FTS）

**選擇**：GIN trigram index（`pg_trgm` extension）

**理由**：
- 用戶搜尋 BattleTag 是前中後綴模糊搜尋（`%text%`），FTS 的 `to_tsvector` 以詞幹為單位，不適合 BattleTag 格式（如 `Ana#TW1234`）
- pg_trgm 對任意位置 `ILIKE '%x%'` 直接加速，無需改動查詢語法
- Supabase 預設啟用 pg_trgm，無額外授權

**替代方案放棄原因**：
- FTS：無法加速中後綴搜尋；BattleTag 含特殊字元 `#`，分詞不穩定
- B-tree：只能加速前綴搜尋（`LIKE 'text%'`），不符 `ILIKE '%text%'` 需求

### 決策 2：CREATE INDEX IF NOT EXISTS（冪等）

所有 `CREATE INDEX` 語句加 `IF NOT EXISTS`，使 migration 可安全重跑而不報錯。

### 決策 3：不使用 CREATE INDEX CONCURRENTLY

Supabase migration 在 transaction 內執行，`CONCURRENTLY` 不能在 transaction block 中使用。目前資料表資料量小，一般 `CREATE INDEX` 不會阻塞讀取（只有寫入 lock，持續時間很短）。若未來資料量大，需改為手動 SQL 執行。

## Risks / Trade-offs

- **pg_trgm 需要 superuser 或 Supabase extension 權限** → Supabase 受管環境預設授權，若出現 `ERROR: permission denied`，在 Dashboard → Database → Extensions 手動啟用 pg_trgm 後重跑 migration
- **GIN 索引建立時間**：資料量大時 index build 較慢（非阻塞讀，但有 CPU 峰值）→ 生產環境大量資料時，考慮離峰手動執行
- **索引儲存空間**：GIN trigram 索引約為資料欄位大小的 2-3 倍 → 目前用戶基數小，可忽略；1 萬用戶約增加 ~50MB 索引空間

## Migration Plan

1. 在 Supabase Dashboard → SQL Editor 貼上 `011_performance_indexes.sql` 並執行
2. 或透過 Supabase CLI：`supabase db push`（需本地已設定 supabase 連線）
3. 驗證：執行 `EXPLAIN ANALYZE` 確認 Index Scan 生效（見 tasks.md 驗收條件）

**Rollback**：
```sql
DROP INDEX IF EXISTS idx_profiles_battle_tag_trgm;
DROP INDEX IF EXISTS idx_profiles_message_trgm;
DROP INDEX IF EXISTS idx_profiles_updated_at_desc;
DROP INDEX IF EXISTS idx_profiles_server;
DROP INDEX IF EXISTS idx_profiles_mic_status;
DROP INDEX IF EXISTS idx_profiles_updated_at_user_id;
-- pg_trgm 通常不 drop，其他 extension 可能依賴
```

## Open Questions

- Supabase CLI 是否已在本機設定（`supabase link`）？若否，migration 須手動在 Dashboard 執行
