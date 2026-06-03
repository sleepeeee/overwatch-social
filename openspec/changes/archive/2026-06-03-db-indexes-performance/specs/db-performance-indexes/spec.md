## ADDED Requirements

### Requirement: pg_trgm extension installed
系統 SHALL 在 PostgreSQL 中安裝 `pg_trgm` 擴充功能，以支援 GIN trigram 索引。

#### Scenario: Extension available after migration
- **WHEN** migration `011_performance_indexes.sql` 執行完成
- **THEN** `SELECT * FROM pg_extension WHERE extname = 'pg_trgm'` 回傳至少一筆結果

### Requirement: GIN trigram index on battle_tag
系統 SHALL 在 `profiles.battle_tag` 欄位建立 GIN trigram 索引 `idx_profiles_battle_tag_trgm`，使 `ILIKE '%text%'` 查詢不觸發 Seq Scan。

#### Scenario: Index exists after migration
- **WHEN** migration `011_performance_indexes.sql` 執行完成
- **THEN** `SELECT indexname FROM pg_indexes WHERE tablename='profiles' AND indexname='idx_profiles_battle_tag_trgm'` 回傳一筆結果

#### Scenario: ILIKE search uses index
- **WHEN** 執行 `EXPLAIN ANALYZE SELECT * FROM public_profiles WHERE battle_tag ILIKE '%ana%' LIMIT 20`
- **THEN** 查詢計畫包含 `Bitmap Index Scan on idx_profiles_battle_tag_trgm`，不包含 `Seq Scan on profiles`

### Requirement: GIN trigram index on message
系統 SHALL 在 `profiles.message` 欄位建立 GIN trigram 索引 `idx_profiles_message_trgm`，使 `ILIKE '%text%'` 查詢不觸發 Seq Scan。

#### Scenario: Index exists after migration
- **WHEN** migration `011_performance_indexes.sql` 執行完成
- **THEN** `SELECT indexname FROM pg_indexes WHERE tablename='profiles' AND indexname='idx_profiles_message_trgm'` 回傳一筆結果

### Requirement: B-tree index on updated_at DESC
系統 SHALL 在 `profiles.updated_at` 建立降序 B-tree 索引 `idx_profiles_updated_at_desc`，使預設 `ORDER BY updated_at DESC LIMIT 20` 查詢使用 Index Scan。

#### Scenario: Default browse query uses index
- **WHEN** 執行 `EXPLAIN ANALYZE SELECT * FROM public_profiles ORDER BY updated_at DESC LIMIT 20`
- **THEN** 查詢計畫包含 `Index Scan using idx_profiles_updated_at_desc`，不包含 `Seq Scan on profiles`

### Requirement: B-tree indexes on server and mic_status
系統 SHALL 分別在 `profiles.server` 和 `profiles.mic_status` 建立 B-tree 索引，供 eq filter 查詢使用。

#### Scenario: server index exists after migration
- **WHEN** migration `011_performance_indexes.sql` 執行完成
- **THEN** `SELECT indexname FROM pg_indexes WHERE tablename='profiles' AND indexname='idx_profiles_server'` 回傳一筆結果

#### Scenario: mic_status index exists after migration
- **WHEN** migration `011_performance_indexes.sql` 執行完成
- **THEN** `SELECT indexname FROM pg_indexes WHERE tablename='profiles' AND indexname='idx_profiles_mic_status'` 回傳一筆結果

### Requirement: Migration is idempotent
系統 SHALL 在 migration 已執行的狀態下，重複執行 `011_performance_indexes.sql` 不產生錯誤。

#### Scenario: Re-run migration without error
- **WHEN** `011_performance_indexes.sql` 已執行過一次後再次執行
- **THEN** 不回傳任何 `ERROR` 訊息（`IF NOT EXISTS` 保護）
