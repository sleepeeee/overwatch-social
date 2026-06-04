-- ============================================================
-- Migration 016: user_profiles 表（全域用戶身份層）
-- 目的：為每個 auth.users 帳號建立一個平台層身份，
--       持有 nickname（選填、非唯一）作為跨遊戲的顯示名稱
-- 設計決策：
--   - user_id PK（1 user = 1 row，絕不重複）
--   - nickname 不加 UNIQUE constraint（允許重複，user_id 才是真正 ID）
--   - 遷移 INSERT 從 profiles 取最後更新的 display_name 作為初始 nickname
-- ============================================================

-- 1. 建立 user_profiles 表
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id   UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. updated_at 自動更新 trigger
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at();

-- 3. RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 所有人可讀（廣場顯示、dev console 搜尋）
CREATE POLICY "user_profiles_select_all"
  ON user_profiles FOR SELECT
  USING (true);

-- 本人可 INSERT（首次設定 nickname）
CREATE POLICY "user_profiles_insert_own"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 本人可 UPDATE（修改 nickname）
CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. GRANT
GRANT SELECT ON user_profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON user_profiles TO authenticated;

-- 5. 遷移 INSERT：從 profiles 取每個 user 最後更新的 display_name 作為初始 nickname
-- DISTINCT ON (user_id) + ORDER BY updated_at DESC = 取最新一張卡的 display_name
INSERT INTO user_profiles (user_id, nickname)
SELECT DISTINCT ON (user_id)
  user_id,
  NULLIF(TRIM(display_name), '')   -- 空字串轉 NULL，不儲存空 nickname
FROM profiles
WHERE display_name IS NOT NULL
ORDER BY user_id, updated_at DESC
ON CONFLICT (user_id) DO NOTHING;  -- 冪等：重跑不會出錯
