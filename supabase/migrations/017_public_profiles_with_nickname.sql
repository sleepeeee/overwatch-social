-- ============================================================
-- Migration 017: public_profiles view 加入 nickname（來自 user_profiles）
-- 目的：廣場公開 view 透過 LEFT JOIN user_profiles 取得全域暱稱
-- 依賴：Migration 016（user_profiles 表必須先存在）
-- ============================================================

DROP VIEW IF EXISTS public_profiles;

CREATE VIEW public_profiles AS
  SELECT
    p.user_id,
    p.server,
    CASE
      WHEN p.is_tag_visible THEN p.battle_tag
      ELSE '隱藏#xxxx'
    END AS battle_tag,
    p.is_tag_visible,
    p.selected_heroes,
    p.tags,
    p.message,
    p.languages,
    p.mic_status,
    p.mbti,
    p.updated_at,
    p.display_name,
    p.game,
    p.social_channels,
    up.nickname            -- 全域暱稱（可為 NULL，前端 fallback 到 display_name 或 user_id）
  FROM profiles p
  LEFT JOIN user_profiles up ON up.user_id = p.user_id;

GRANT SELECT ON public_profiles TO anon, authenticated;
