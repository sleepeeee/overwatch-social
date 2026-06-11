-- ============================================================
-- Migration 018: 名片下架（moderation）+ public_profiles view 修正重建
--
-- 1. profiles 加 is_hidden（developer 下架違規名片用，預設 false）
-- 2. 重建 public_profiles view：
--    - 補上 nickname LEFT JOIN（migration 017 從未套用至 prod）
--    - 保留 social_channels 遮蔽（017 的版本漏掉遮蔽，套用會洩漏
--      社群帳號原始值給 anon——本檔取代 017，017 不應再被套用）
--    - 過濾 is_hidden = true 的名片
--
-- ⚠️ 安全警告：此 view 為 SECURITY DEFINER（繞過 profiles RLS），
--    view 內的每一個欄位都等於對全網公開。修改欄位清單前必須
--    逐欄確認不含隱私資料（社群帳號值、Email 等）。
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

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
    -- 遮蔽：只露出「有哪些平台」，不露帳號值
    CASE
      WHEN p.social_channels IS NOT NULL AND p.social_channels::text <> '{}'::text
        THEN (SELECT jsonb_object_agg(k.k, to_jsonb(true)) FROM jsonb_object_keys(p.social_channels) k(k))
      ELSE p.social_channels
    END AS social_channels,
    up.nickname  -- 全域暱稱（可為 NULL，前端 fallback 到 display_name 或 user_id）
  FROM profiles p
  LEFT JOIN user_profiles up ON up.user_id = p.user_id
  WHERE NOT p.is_hidden;

GRANT SELECT ON public_profiles TO anon, authenticated;
