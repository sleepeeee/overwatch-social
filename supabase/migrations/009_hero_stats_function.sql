-- migration 009: get_hero_stats() function
CREATE OR REPLACE FUNCTION get_hero_stats()
RETURNS TABLE(hero_id text, hero_count bigint) 
SECURITY DEFINER
-- 🔒 關鍵安全防護：固定 search_path 避免 Schema 注入
SET search_path = public
AS $$
DECLARE user_role text;
BEGIN
  -- 🔒 透過呼叫方的 JWT 進行防禦性角色校驗
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') INTO user_role;
  IF user_role != 'developer' THEN
    RAISE EXCEPTION 'Permission denied: developer role required';
  END IF;

  RETURN QUERY
    -- 🛠️ 修復 unnest 搭配 GROUP BY 在 SELECT 中導致的語法錯誤，改用 lateral cross join 展開
    SELECT h_id, COUNT(*)
    FROM profiles,
         unnest(selected_heroes) AS h_id
    GROUP BY h_id
    ORDER BY 2 DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- 🔒 僅授權給登入用戶呼叫（anon 被拒）
REVOKE ALL ON FUNCTION get_hero_stats() FROM public;
GRANT EXECUTE ON FUNCTION get_hero_stats() TO authenticated;
