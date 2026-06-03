-- Migration 012: profiles 表加入 display_name 欄位
-- 背景：display_name 先前只存 localStorage，換裝置後消失。
-- 現在存入 DB，AuthContext 可跨裝置讀取。
-- display_name 為用戶在平台上顯示的暱稱（非 BattleTag），屬個人設定，不放入 public_profiles view。

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
