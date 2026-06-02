-- ============================================================
-- Migration 006: GRANT 必要權限給 authenticated / anon
-- 修復：migration 001 建立 profiles 表時未補 GRANT，
-- 導致 authenticated role 無法 INSERT / UPDATE，儲存名片失敗。
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated, anon;
