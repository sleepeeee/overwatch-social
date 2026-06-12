-- ============================================================
-- Migration 020: 用戶自助「隱藏整張卡片」+ view 過濾
--
-- 背景：工作室的「直接隱藏卡片」開關原本誤接到 is_tag_visible
-- （只遮 BattleTag），文案承諾「從廣場消失」但卡片仍可見。
-- 本 migration 新增正確的欄位並讓 view 過濾。
--
-- 欄位語意區分：
--   is_hidden       = 站方下架（moderation，用戶不可自行解除）
--   is_card_visible = 用戶自己隱藏（工作室開關，可自行恢復）
--   is_tag_visible  = 只遮 BattleTag（卡片仍在廣場）
--
-- ⚠️ 安全警告：此 view 為 SECURITY DEFINER（繞過 profiles RLS），
--    view 內的每一個欄位都等於對全網公開。修改欄位清單前必須
--    逐欄確認不含隱私資料。
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_card_visible boolean NOT NULL DEFAULT true;

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
  WHERE NOT p.is_hidden
    AND p.is_card_visible;

GRANT SELECT ON public_profiles TO anon, authenticated;
