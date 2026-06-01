-- ============================================================
-- Migration 004: Developer SELECT policy for profiles table
-- 允許 app_metadata.role = 'developer' 的用戶讀取所有 profiles
-- ============================================================

-- 新增 developer SELECT policy（OR 邏輯：不影響現有 "profiles select own" policy）
CREATE POLICY "profiles select developer"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'developer'
    OR (SELECT auth.uid()) = user_id
  );
