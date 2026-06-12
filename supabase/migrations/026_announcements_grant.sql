-- ============================================================
-- Migration 022: GRANT 必要權限（最小權限版）
-- 修復：announcements / hero_alignments / game_special_tags /
-- developer_whitelist 未補 GRANT，authenticated 寫入時拋
-- permission denied。
-- 原則：anon 僅給公開讀表的 SELECT；寫入只開 authenticated，
-- 實際寫入限制由各表既有 RLS（developer role）把關；
-- developer_whitelist 完全不授權 anon（其 RLS 僅服務 authenticated）。
-- ============================================================

GRANT SELECT ON public.announcements, public.hero_alignments, public.game_special_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements, public.hero_alignments, public.game_special_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.developer_whitelist TO authenticated;
