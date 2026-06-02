-- 1. 建立特色標籤資料表
CREATE TABLE IF NOT EXISTS public.game_special_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  style_class TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 啟用行級安全 (RLS)
ALTER TABLE public.game_special_tags ENABLE ROW LEVEL SECURITY;

-- 2. 建立 RLS 政策
-- 所有人皆可讀取標籤
CREATE POLICY "Allow public select on game_special_tags" 
  ON public.game_special_tags
  FOR SELECT
  USING (true);

-- 僅限開發者角色可寫入/更新/刪除標籤
CREATE POLICY "Allow developers full access to game_special_tags" 
  ON public.game_special_tags
  FOR ALL
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer');

-- 3. 插入初始鬥陣特攻特色標籤
INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
VALUES 
  ('overwatch', '槍神', 'bg-[#8fa8a2]/15 text-[#59756f] border-[#8fa8a2]/30'),
  ('overwatch', '刺客身手', 'bg-[#bfa1a1]/15 text-[#8c6c6c] border-[#bfa1a1]/30'),
  ('overwatch', '輔助天花板', 'bg-[#8ca9b3]/15 text-[#5c7c88] border-[#8ca9b3]/30'),
  ('overwatch', '重裝守護者', 'bg-[#b4a091]/15 text-[#8c6c5c] border-[#b4a091]/30'),
  ('overwatch', '慈悲專車', 'bg-[#bfa1a1]/15 text-[#8c6c6c] border-[#bfa1a1]/30'),
  ('overwatch', '全能補位', 'bg-[#8fa8a2]/15 text-[#59756f] border-[#8fa8a2]/30'),
  ('overwatch', '神射手', 'bg-[#b4a091]/15 text-[#8c6c5c] border-[#b4a091]/30'),
  ('overwatch', '音波大師', 'bg-[#8ca9b3]/15 text-[#5c7c88] border-[#8ca9b3]/30'),
  ('overwatch', '精準奪命勾', 'bg-[#b4a091]/15 text-[#8c6c5c] border-[#b4a091]/30'),
  ('overwatch', '奈米刀源氏', 'bg-[#bfa1a1]/15 text-[#8c6c6c] border-[#bfa1a1]/30')
ON CONFLICT DO NOTHING;
