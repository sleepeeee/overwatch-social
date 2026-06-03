-- ============================================================
-- Migration 013: display_name 進 public_profiles view + game 欄位
-- 合併兩個 change 避免 view 重建兩次：
--   - display_name（Migration 012 已加欄位，但 view 未更新）
--   - game（多遊戲廣場 schema 基礎）
-- ============================================================

-- 1. profiles 表加入 game 欄位（display_name 已在 Migration 012 加入）
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS game TEXT NOT NULL DEFAULT 'overwatch';

-- 2. 索引：加速廣場按遊戲分頁查詢
CREATE INDEX IF NOT EXISTS idx_profiles_game
  ON profiles (game);

CREATE INDEX IF NOT EXISTS idx_profiles_game_updated_at
  ON profiles (game, updated_at DESC);

-- 3. 重建 public_profiles view（包含 display_name + game）
-- PostgreSQL 不允許 CREATE OR REPLACE VIEW 新增欄位，需先 DROP
DROP VIEW IF EXISTS public_profiles;

CREATE VIEW public_profiles AS
  SELECT
    user_id,
    server,
    CASE
      WHEN is_tag_visible THEN battle_tag
      ELSE '隱藏#xxxx'
    END AS battle_tag,
    is_tag_visible,
    selected_heroes,
    tags,
    message,
    languages,
    mic_status,
    mbti,
    updated_at,
    display_name,  -- 新增：廣場顯示名稱（可為 NULL，未設定時前端 fallback 到 battle_tag）
    game           -- 新增：遊戲分區（'overwatch' | 'lol' | 'valorant'）
  FROM profiles;

GRANT SELECT ON public_profiles TO anon, authenticated;
