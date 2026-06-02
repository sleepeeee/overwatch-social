-- ============================================================
-- Migration 008: 修正 social_channels 隱私問題
-- 問題：migration 007 將 social_channels 放入 public_profiles view，
-- anon role 可直接透過 REST API 爬取所有聯絡方式（隱私洩漏）。
-- 修法：
--   1. 移除 social_channels from public_profiles view
--   2. 新增 RLS policy：authenticated users 可讀 is_tag_visible=true 的 profiles
--      （讓玩家詳細頁在登入後可以讀到 social_channels）
-- ============================================================

-- 1. 還原 public_profiles view（移除 social_channels）
-- 注意：PostgreSQL 不允許 CREATE OR REPLACE VIEW 移除欄位，需先 DROP
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
    updated_at
    -- social_channels 故意排除：聯絡資訊只對登入用戶開放（via profiles 表直接讀取）
  FROM profiles;

GRANT SELECT ON public_profiles TO anon, authenticated;

-- 2. 新增 RLS policy：authenticated users 可讀 is_tag_visible=true 的 profiles
--    （僅 SELECT；其他操作由 profiles insert/update own 控制）
CREATE POLICY "authenticated read visible profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_tag_visible = true OR (SELECT auth.uid()) = user_id);
