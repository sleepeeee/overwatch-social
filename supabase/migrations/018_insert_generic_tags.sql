-- 批次新增通用特色標籤，並使用 EXISTS 檢查以防重複寫入

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#積分玩家', 'bg-[#bfa1a1]/15 text-[#8c6c6c] border-[#bfa1a1]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#積分玩家');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#歡樂一般', 'bg-[#8fa8a2]/15 text-[#59756f] border-[#8fa8a2]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#歡樂一般');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#只打遊樂場', 'bg-[#8ca9b3]/15 text-[#5c7c88] border-[#8ca9b3]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#只打遊樂場');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#歡迎開麥', 'bg-[#bfa1a1]/15 text-[#8c6c6c] border-[#bfa1a1]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#歡迎開麥');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#拒絕暴躁', 'bg-[#8fa8a2]/15 text-[#59756f] border-[#8fa8a2]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#拒絕暴躁');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#安靜推車', 'bg-[#8ca9b3]/15 text-[#5c7c88] border-[#8ca9b3]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#安靜推車');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#尋找長期隊友', 'bg-[#b4a091]/15 text-[#8c6c5c] border-[#b4a091]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#尋找長期隊友');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#深夜開打', 'bg-[#8ca9b3]/15 text-[#5c7c88] border-[#8ca9b3]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#深夜開打');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#下班休閒', 'bg-[#b4a091]/15 text-[#8c6c5c] border-[#b4a091]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#下班休閒');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#認真組排', 'bg-[#bfa1a1]/15 text-[#8c6c6c] border-[#bfa1a1]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#認真組排');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#不計輸贏', 'bg-[#8fa8a2]/15 text-[#59756f] border-[#8fa8a2]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#不計輸贏');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#專職補位', 'bg-[#8ca9b3]/15 text-[#5c7c88] border-[#8ca9b3]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#專職補位');
