-- ============================================================
-- Migration 011: Performance indexes for browse at scale
-- 為廣場查詢建立索引，支撐上千用戶
-- Prerequisites: profiles table (001)
-- ============================================================

-- 1. Enable pg_trgm extension (ilike '%text%' GIN 索引依賴)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. GIN trigram 索引：加速 battle_tag ILIKE '%text%' 搜尋
--    作用於 base table；PostgreSQL planner 透過 view 查詢時自動套用
CREATE INDEX IF NOT EXISTS idx_profiles_battle_tag_trgm
  ON profiles USING GIN (battle_tag gin_trgm_ops);

-- 3. GIN trigram 索引：加速 message ILIKE '%text%' 搜尋
CREATE INDEX IF NOT EXISTS idx_profiles_message_trgm
  ON profiles USING GIN (message gin_trgm_ops);

-- 4. B-tree 索引：加速預設 ORDER BY updated_at DESC LIMIT 20
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at_desc
  ON profiles (updated_at DESC);

-- 5. B-tree 索引：加速 server eq filter（供 Change 2 browse-db-filter 使用）
CREATE INDEX IF NOT EXISTS idx_profiles_server
  ON profiles (server);

-- 6. B-tree 索引：加速 mic_status eq filter（供 Change 2 browse-db-filter 使用）
CREATE INDEX IF NOT EXISTS idx_profiles_mic_status
  ON profiles (mic_status);

-- 7. 複合索引：為未來 cursor-based pagination 預備
--    支援 ORDER BY updated_at DESC, user_id 的 index-only scan
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at_user_id
  ON profiles (updated_at DESC, user_id);
