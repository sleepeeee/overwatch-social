-- ============================================================
-- Migration 019: 玩家本體與遊戲名片資料正規化
-- 目的：
--   1. 從仍存在 auth.users 的遊戲名片補齊 user_profiles
--   2. 將 OW server 舊顯示字串轉為 canonical 代號
--   3. 找不到 auth.users 的孤兒卡先下架，不做永久刪除
-- ============================================================

-- 1. 補齊玩家本體資料：只補 auth.users 仍存在的卡片持有人
INSERT INTO user_profiles (user_id, nickname)
SELECT DISTINCT ON (p.user_id)
  p.user_id,
  NULLIF(TRIM(p.display_name), '')
FROM profiles p
JOIN auth.users au ON au.id = p.user_id
WHERE NOT EXISTS (
  SELECT 1
  FROM user_profiles up
  WHERE up.user_id = p.user_id
)
ORDER BY p.user_id, p.updated_at DESC
ON CONFLICT (user_id) DO NOTHING;

-- 2. OW 伺服器正規化：資料庫只保存 asia / america / europe
UPDATE profiles
SET server = CASE
  WHEN lower(trim(server)) IN ('asia', 'asia server', '亞洲 (asia)', '亞洲伺服器', '亞太伺服器', '亞太 (apac)') THEN 'asia'
  WHEN lower(trim(server)) IN ('america', 'america server', '美洲伺服器', '北美 (na)') THEN 'america'
  WHEN lower(trim(server)) IN ('europe', 'europe server', '歐洲伺服器', '歐洲 (eu)') THEN 'europe'
  ELSE server
END
WHERE game = 'overwatch'
  AND server IS NOT NULL
  AND server <> CASE
    WHEN lower(trim(server)) IN ('asia', 'asia server', '亞洲 (asia)', '亞洲伺服器', '亞太伺服器', '亞太 (apac)') THEN 'asia'
    WHEN lower(trim(server)) IN ('america', 'america server', '美洲伺服器', '北美 (na)') THEN 'america'
    WHEN lower(trim(server)) IN ('europe', 'europe server', '歐洲伺服器', '歐洲 (eu)') THEN 'europe'
    ELSE server
  END;

-- 3. 真正找不到登入帳號的孤兒卡：先下架，不刪除
UPDATE profiles p
SET is_tag_visible = false
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.users au
  WHERE au.id = p.user_id
);
