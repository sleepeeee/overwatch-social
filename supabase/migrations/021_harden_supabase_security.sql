-- ============================================================
-- Migration 021: Supabase 安全邊界硬化（security advisor 5 項 + 已上線 PII 洩漏）
-- 對應 change: harden-supabase-security
-- 基準線（2026-06-11 advisor security）：
--   1 ERROR  security_definer_view（public_profiles）→ 文件化為 controlled exception，刻意保留
--   WARN     anon_security_definer_function_executable（handle_developer_role_sync）
--   WARN     function_search_path_mutable ×3
--   WARN     public_bucket_allows_listing（announcement-icons）
--   INFO     rls_enabled_no_policy（developer_whitelist，4 筆資料卻 0 policy → 後台靜默讀空）
--
-- M1 決策（team lead + Codex §6.5）：public_profiles 維持 SECURITY DEFINER，
--   投影遮罩 social_channels 帳號 PII，並 REVOKE anon 直查 base table。
--   改 security_invoker 會強制 anon 對 profiles 具備 SELECT+RLS，反讓 anon 直查帳號，故否決。
-- ============================================================

-- ---- [1] public_profiles：維持 definer，遮罩 social_channels 帳號 PII ----
-- 修復已上線洩漏：migration 015 把 social_channels 真實帳號補回 anon-readable view，回退了 F-014。
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
  SELECT
    user_id,
    server,
    CASE WHEN is_tag_visible THEN battle_tag ELSE '隱藏#xxxx' END AS battle_tag,
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
    -- 遮罩：保留平台鍵供前端圖示渲染，value 一律 true，移除帳號 PII（延續 F-014 / ADR-14）
    CASE
      WHEN social_channels IS NOT NULL AND social_channels::text <> '{}'
      THEN (SELECT jsonb_object_agg(k, to_jsonb(true)) FROM jsonb_object_keys(social_channels) k)
      ELSE social_channels
    END AS social_channels
  FROM public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- defense-in-depth：撤銷 anon 對 base table 的直查（RLS 已 deny，此為硬保險防未來誤加 anon policy）
REVOKE SELECT ON public.profiles FROM anon;

-- ---- [2] REVOKE trigger function 對外 EXECUTE（防 /rest/v1/rpc/ 直呼）----
REVOKE EXECUTE ON FUNCTION public.handle_developer_role_sync() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_user_profiles_updated_at() FROM PUBLIC;

-- ---- [3] 鎖定 3 個 function search_path（body 一字不改）----
-- now() = pg_catalog.now()（空 search_path 仍解析）；public.developer_whitelist 已 schema-qualified
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_developer_role_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.developer_whitelist WHERE email = NEW.email) THEN
    NEW.raw_app_meta_data = jsonb_set(
      COALESCE(NEW.raw_app_meta_data, '{}'::jsonb), '{role}', '"developer"'::jsonb);
  ELSE
    NEW.raw_app_meta_data = NEW.raw_app_meta_data - 'role';
  END IF;
  RETURN NEW;
END; $$;
-- 註：CREATE OR REPLACE 保留 grant；上方 [2] REVOKE 已具現化 ACL，replace 後仍維持撤銷。

-- ---- [4] 收斂 announcement-icons bucket 列舉 ----
-- public bucket 物件由 /storage/v1/object/public/... URL 直取、不經 RLS；移除可列舉 SELECT policy
DROP POLICY IF EXISTS "Public read announcement icons" ON storage.objects;

-- ---- [5] developer_whitelist 補 developer policy（修 P1：0 policy 致後台靜默讀空）----
CREATE POLICY "developer_whitelist_select_developer"
  ON public.developer_whitelist FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer');

CREATE POLICY "developer_whitelist_modify_developer"
  ON public.developer_whitelist FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer');
