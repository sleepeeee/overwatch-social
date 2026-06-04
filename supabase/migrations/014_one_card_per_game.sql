-- ============================================================
-- Migration 014: profiles 表 PK 重構 + one-card-per-game 約束
-- 目的：引入代理鍵 id，以 UNIQUE(user_id, game) 取代隱性的 user_id PK 唯一性
-- 資料安全：現有行 game 全為 'overwatch'，無衝突；id 欄位自動填 UUID
-- ============================================================

-- 1. 加代理鍵（現有行自動填 UUID，NOT NULL 保證）
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS id UUID NOT NULL DEFAULT gen_random_uuid();

-- 2. 換 PK：移除 user_id PK，改用 id
ALTER TABLE profiles DROP CONSTRAINT profiles_pkey;
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- 3. 加 (user_id, game) unique constraint
ALTER TABLE profiles
  ADD CONSTRAINT profiles_user_game_unique UNIQUE (user_id, game);

-- 4. 補 user_id 索引（原 PK 自帶索引，換 PK 後需手動補，保持查詢效能）
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles (user_id);
