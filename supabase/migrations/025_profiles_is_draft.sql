-- ============================================================
-- Migration 025: 草稿卡標記 is_draft
--
-- 背景：用戶進入名片編輯器但沒按儲存就離開時，DB 完全沒有名片列，
-- 後台看起來是「未填入」。改為進入編輯器即自動建檔（provision）：
--   is_draft = true        系統建的草稿（隨機預設名稱）
--   is_card_visible = false 草稿不出現在廣場
-- 用戶第一次真正按儲存 → is_draft = false、is_card_visible 依開關。
-- 後台統計「已完成名片」排除 is_draft = true。
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_draft boolean NOT NULL DEFAULT false;
