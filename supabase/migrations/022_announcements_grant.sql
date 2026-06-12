-- ============================================================
-- Migration 020: GRANT 必要權限給 authenticated / anon
-- 修復：以下資料表未補 GRANT，導致 authenticated / anon role 無法正常執行
-- SELECT, INSERT, UPDATE, DELETE 等操作而拋出 permission denied 錯誤。
-- 註：實際安全防護仍由各資料表已啟用的 RLS (Row Level Security) 政策嚴格把關。
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_alignments TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_special_tags TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.developer_whitelist TO authenticated, anon;

