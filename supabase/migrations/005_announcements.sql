-- ============================================================
-- Migration 005: announcements 表 + RLS
-- 取代 homepage.ts 原本的 filesystem JSON 儲存
-- ============================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  num             TEXT PRIMARY KEY,           -- '01', '02', '03', '04'
  tag             TEXT NOT NULL DEFAULT '',
  title           TEXT NOT NULL DEFAULT '',
  color           TEXT NOT NULL DEFAULT 'rgba(130, 183, 204, 0.85)',
  message         TEXT NOT NULL DEFAULT '',
  custom_icon_url TEXT NOT NULL DEFAULT '',
  alignments      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 任何人可讀（首頁公開展示）
CREATE POLICY "Public read announcements"
  ON public.announcements FOR SELECT
  USING (true);

-- 只有 developer 可寫
CREATE POLICY "Developer write announcements"
  ON public.announcements FOR ALL
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'developer'
  );

-- updated_at 自動更新（複用 Migration 001 建立的函數）
CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Seed：4 筆預設公告（冪等，已存在則跳過）
-- ============================================================

INSERT INTO public.announcements (num, tag, title, color, message, custom_icon_url, alignments) VALUES
(
  '01', 'ADMIN''S COLUMN', '站長隨筆手札 ✍️', 'rgba(130, 183, 204, 0.85)',
  '給深夜還在線上的硬派玩家。在這裡，我們用名片點亮孤單的星空，幫助你找到能在耳麥裡分享勝負的靈魂伴侶。',
  '',
  '{"icon_x":0,"icon_y":0,"icon_scale":100,"title_font_size":18,"title_x":0,"title_y":0,"message_font_size":13,"message_x":0,"message_y":0,"buttons_x":0,"buttons_y":0,"tag_font_size":10,"tag_x":0,"tag_y":0}'
),
(
  '02', 'CHANGELOG', '最新改版日誌 🚀', 'rgba(245, 212, 107, 0.85)',
  'v0.12.0 大改版：首頁全面解耦鬥陣特攻，支持跨遊戲大廳！新增『每日幸友翻牌』與『揪團活動行事曆』。',
  '',
  '{"icon_x":0,"icon_y":0,"icon_scale":100,"title_font_size":18,"title_x":0,"title_y":0,"message_font_size":13,"message_x":0,"message_y":0,"buttons_x":0,"buttons_y":0,"tag_font_size":10,"tag_x":0,"tag_y":0}'
),
(
  '03', 'CONTACT US', '加入玩家語音 ✉️', 'rgba(235, 220, 216, 0.85)',
  'Discord 全局官方語音群已就緒！點擊頭像即可前往，與各路特工、召喚師與休閒大師一同暢聊開黑。',
  '',
  '{"icon_x":0,"icon_y":0,"icon_scale":100,"title_font_size":18,"title_x":0,"title_y":0,"message_font_size":13,"message_x":0,"message_y":0,"buttons_x":0,"buttons_y":0,"tag_font_size":10,"tag_x":0,"tag_y":0}'
),
(
  '04', 'SUPPORT US', '請站長喝杯咖啡 ☕', 'rgba(140, 124, 108, 0.85)',
  '如果這個禪意手帳風的小站溫暖了你，歡迎買杯咖啡支持本站。我們將持續開發更多有趣、精美的遊戲社群小工具！',
  '',
  '{"icon_x":0,"icon_y":0,"icon_scale":100,"title_font_size":18,"title_x":0,"title_y":0,"message_font_size":13,"message_x":0,"message_y":0,"buttons_x":0,"buttons_y":0,"tag_font_size":10,"tag_x":0,"tag_y":0}'
)
ON CONFLICT (num) DO NOTHING;
