-- ============================================================
-- Migration 020: OW 伺服器值域約束（接續 019 正規化後的「上鎖」）
-- 目的：
--   019 已把 overwatch 名片的 server 洗成 canonical（asia/america/europe），
--   本 migration 在資料庫層加上 CHECK 約束，從源頭擋掉非法值，
--   不再只依賴應用層 normalizeOverwatchServer() 把關。
--
-- 設計：條件式約束，只限 overwatch；其他遊戲（valorant/lol）的 server
--       值域不同，未來接入時不受此約束影響。
-- 前置：套用前 overwatch 名片的 server 必須已全為 canonical（019 已完成）。
-- ============================================================

ALTER TABLE profiles
  ADD CONSTRAINT profiles_overwatch_server_valid
  CHECK (game <> 'overwatch' OR server IN ('asia', 'america', 'europe'));
