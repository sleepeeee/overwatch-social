-- ============================================================
-- Migration 007: public_profiles view 加入 social_channels
-- 背景：is_tag_visible=true 代表玩家同意公開出現在廣場，
-- 因此對已公開的玩家顯示 social_channels 是合理的。
-- 修正：原 view 未包含 social_channels，導致詳細頁無法顯示聯絡方式。
-- ============================================================

CREATE OR REPLACE VIEW public_profiles AS
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
    social_channels   -- 新增：公開玩家的聯絡方式
  FROM profiles
  WHERE is_tag_visible = true;  -- 只有主動公開的玩家才進 view

-- 確保 anon / authenticated 可讀（原有 grant 對 view 仍有效）
GRANT SELECT ON public_profiles TO anon, authenticated;
