## 1. 建立 Migration 檔案

- [x] 1.1 建立 `supabase/migrations/011_performance_indexes.sql`，內含 `CREATE EXTENSION IF NOT EXISTS pg_trgm`
- [x] 1.2 加入 `idx_profiles_battle_tag_trgm`（GIN trigram，battle_tag）
- [x] 1.3 加入 `idx_profiles_message_trgm`（GIN trigram，message）
- [x] 1.4 加入 `idx_profiles_updated_at_desc`（B-tree DESC，updated_at）
- [x] 1.5 加入 `idx_profiles_server`（B-tree，server）
- [x] 1.6 加入 `idx_profiles_mic_status`（B-tree，mic_status）
- [x] 1.7 加入 `idx_profiles_updated_at_user_id`（複合索引，updated_at DESC + user_id）

## 2. 部署至 Supabase

- [ ] 2.1 在 Supabase Dashboard → SQL Editor 貼上並執行 `011_performance_indexes.sql`
- [ ] 2.2 確認執行無 ERROR（特別注意 pg_trgm extension 權限）

## 3. 驗收

- [ ] 3.1 在 SQL Editor 執行：`SELECT indexname FROM pg_indexes WHERE tablename='profiles'`，確認 6 個索引均出現
- [ ] 3.2 執行 `EXPLAIN ANALYZE SELECT * FROM public_profiles ORDER BY updated_at DESC LIMIT 20`，確認計畫含 `Index Scan` 而非 `Seq Scan`
- [ ] 3.3 執行 `EXPLAIN ANALYZE SELECT * FROM public_profiles WHERE battle_tag ILIKE '%ana%' LIMIT 20`，確認計畫含 `Bitmap Index Scan on idx_profiles_battle_tag_trgm`
- [ ] 3.4 重複執行 migration，確認無 ERROR（冪等驗證）
