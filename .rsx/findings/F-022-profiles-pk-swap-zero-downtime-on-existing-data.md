---
id: F-022
change: one-card-per-game-constraint
date: 2026-06-04
severity: INFO
title: profiles PK 換代理鍵在現有 4 rows 下零中斷執行
---

## 發現

Migration 014 執行「DROP CONSTRAINT profiles_pkey + ADD PRIMARY KEY (id)」
在 Supabase Production 環境（4 rows，全為 overwatch）零中斷成功完成。

## 數據

- 執行時間：< 1 秒（4 rows，無鎖爭奪）
- UNIQUE(user_id, game) constraint 同批次建立：無衝突（4 rows 中 user_id 各唯一）
- 後續 `idx_profiles_user_id` 索引建立：即時完成

## 意義

- 確認「代理鍵 + 複合 unique」遷移策略在小資料量下可 in-place 執行，無需停機視窗
- 若未來資料量大（> 10萬 rows），ALTER TABLE ADD PRIMARY KEY 會需要 ACCESS EXCLUSIVE LOCK，
  需改用 pg_repack 或排程維護視窗處理

## 相關

- [[REF-021]] PostgreSQL PK 遷移安全步驟
- ADR-21（同 change 建立）
