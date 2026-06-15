-- 027_add_more_special_tags
-- 新增兩個玩家綽號類特色標籤（戲謔風格）
-- 沿用 018 的 idempotent pattern（NOT EXISTS 防重）
-- 配色使用現有 4 色循環中最貼近名稱暗示色的兩款（粉紅棕、米棕）

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#紫色榴槤怪', 'bg-[#bfa1a1]/15 text-[#8c6c6c] border-[#bfa1a1]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#紫色榴槤怪');

INSERT INTO public.game_special_tags (game_id, tag_name, style_class)
SELECT 'overwatch', '#黃金大蟑螂', 'bg-[#b4a091]/15 text-[#8c6c5c] border-[#b4a091]/30'
WHERE NOT EXISTS (SELECT 1 FROM public.game_special_tags WHERE game_id = 'overwatch' AND tag_name = '#黃金大蟑螂');
