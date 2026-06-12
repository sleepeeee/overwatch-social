-- ============================================================
-- Migration 019: 補 service_role 對 profiles 的 DML 權限
-- 根因：migration 006 權限整理只 GRANT 給 authenticated，漏了
-- service_role，導致 admin client（SUPABASE_SECRET_KEY）執行
-- moderation 下架（UPDATE profiles.is_hidden）時 permission denied。
-- 由 2026-06-11 Haiku 瀏覽器實測抓出。
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;
