-- 1. 建立白名單資料表
CREATE TABLE IF NOT EXISTS public.developer_whitelist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 啟用行級安全 (RLS)
ALTER TABLE public.developer_whitelist ENABLE ROW LEVEL SECURITY;

-- 僅允許 developer 角色的使用者操作白名單 (冷啟動時可直接在資料庫後台插入首筆白名單)
CREATE POLICY "Allow developers full access to whitelist" 
  ON public.developer_whitelist
  FOR ALL
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer');

-- 2. 建立自動化角色指派函數 (SECURITY DEFINER 確保擁有系統寫入權限)
CREATE OR REPLACE FUNCTION public.handle_developer_role_sync()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.developer_whitelist WHERE email = NEW.email) THEN
    -- 將 raw_app_meta_data 的 role 欄位原子化設為 "developer"
    NEW.raw_app_meta_data = jsonb_set(
      COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"developer"'::jsonb
    );
  ELSE
    -- 非白名單用戶，確保其 role 不被誤設，防止髒資料越權
    NEW.raw_app_meta_data = NEW.raw_app_meta_data - 'role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 掛載 Trigger 到 auth.users 表 (BEFORE INSERT OR UPDATE)
DROP TRIGGER IF EXISTS on_auth_user_role_sync ON auth.users;
CREATE TRIGGER on_auth_user_role_sync
  BEFORE INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_developer_role_sync();

-- 4. 插入初始種子資料（Bootstrap Whitelist）
-- 提示：此處可直接預設一筆開發信箱以利開發測試，您可以隨時在資料庫中修改或新增
INSERT INTO public.developer_whitelist (email) 
VALUES ('a1214@example.com')
ON CONFLICT (email) DO NOTHING;
