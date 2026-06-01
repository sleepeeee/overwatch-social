-- Migration: 003_hero_alignments
-- hero_alignments 表 + RLS + developer profiles policy

-- 1. 建立 hero_alignments 表
CREATE TABLE IF NOT EXISTS public.hero_alignments (
  hero_id TEXT PRIMARY KEY,
  scale NUMERIC(4,2) NOT NULL DEFAULT 1.80,
  translate_x INTEGER NOT NULL DEFAULT 0,
  translate_y INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.hero_alignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read hero_alignments"
  ON public.hero_alignments FOR SELECT USING (true);

CREATE POLICY "Developer write hero_alignments"
  ON public.hero_alignments FOR ALL
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer');

-- 2. 讓 developer 可查詢全部 profiles（用於 getSystemStats）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
    AND policyname = 'Developers can view all profiles for stats'
  ) THEN
    CREATE POLICY "Developers can view all profiles for stats"
      ON profiles FOR SELECT
      USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Seed 51 筆英雄對準資料（冪等：已存在則跳過）
INSERT INTO public.hero_alignments (hero_id, scale, translate_x, translate_y)
VALUES
  ('ana', 3.00, 6, -7),
  ('anran', 3.00, 2, -4),
  ('ashe', 3.00, 8, 0),
  ('baptiste', 3.00, -7, -10),
  ('bastion', 2.45, 0, -4),
  ('brigitte', 3.00, 0, -4),
  ('cassidy', 3.00, 1, 2),
  ('domina', 3.00, 1, 0),
  ('doomfist', 3.00, -8, -2),
  ('dva', 2.85, 18, -32),
  ('echo', 3.00, 5, -3),
  ('emre', 3.00, 10, 0),
  ('freja', 3.00, -6, -2),
  ('genji', 3.00, 0, -2),
  ('hanzo', 2.65, 4, 1),
  ('hazard', 3.00, 0, 1),
  ('illari', 3.00, 6, 1),
  ('jetpack-cat', 1.50, 4, 6),
  ('junker-queen', 3.00, 0, -2),
  ('junkrat', 3.00, -8, 0),
  ('juno', 3.00, 0, -1),
  ('kiriko', 3.00, 8, -4),
  ('lifeweaver', 3.00, 9, -1),
  ('lucio', 3.00, 6, -6),
  ('mauga', 3.00, -4, 3),
  ('mei', 3.00, 6, 0),
  ('mercy', 3.00, 27, 0),
  ('mizuki', 3.00, 10, -2),
  ('moira', 3.00, 0, -6),
  ('orisa', 3.00, 4, -6),
  ('pharah', 3.00, -11, 0),
  ('ramattra', 3.00, -10, -19),
  ('reaper', 3.00, 2, -5),
  ('reinhardt', 3.00, 12, -4),
  ('roadhog', 3.00, 0, -6),
  ('sierra', 3.00, 0, -1),
  ('sigma', 3.00, 0, 0),
  ('sojourn', 3.00, 8, 0),
  ('soldier-76', 3.00, -3, -1),
  ('sombra', 3.00, 0, -1),
  ('symmetra', 3.00, 1, 0),
  ('torbjorn', 2.50, 8, -28),
  ('tracer', 3.00, 4, -2),
  ('vendetta', 3.00, 18, -16),
  ('venture', 3.00, 3, 1),
  ('widowmaker', 3.00, 10, 0),
  ('winston', 2.30, 22, -7),
  ('wrecking-ball', 3.00, 2, 3),
  ('wuyang', 3.00, -4, 0),
  ('zarya', 3.00, 8, 0),
  ('zenyatta', 2.00, -8, 3)
ON CONFLICT (hero_id) DO NOTHING;
