-- ============================================================
-- Migration 015: 補回 social_channels 至 public_profiles view
-- 背景：Migration 013 重建 view 時遺漏了 social_channels 欄位
-- 結果：廣場玩家名片底部 Discord/Steam/X/Line 圖示無法顯示
-- ============================================================

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
    display_name,
    game,
    social_channels  -- 補回：廣場名片社群管道圖示（Discord/Steam/X/Line）需要此欄位
  FROM profiles;

GRANT SELECT ON public_profiles TO anon, authenticated;
