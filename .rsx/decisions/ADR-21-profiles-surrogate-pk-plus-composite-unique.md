---
id: ADR-21
change: one-card-per-game-constraint
date: 2026-06-04
status: Accepted
title: profiles 表採代理鍵(id UUID) + UNIQUE(user_id,game) 取代單欄 user_id PK
---

## 決策

將 profiles 表的 PK 從 `user_id UUID` 改為 `id UUID`（代理鍵），
並加入 `UNIQUE(user_id, game)` 作為業務層唯一約束。

## 原因

- `user_id PK` 隱性強制「每人只有一行」，無法支援多遊戲（每遊戲一張卡）
- 改為代理鍵後，`(user_id, game)` 成為 business unique key，符合「一人一遊戲一卡」語義
- upsert `onConflict: "user_id,game"` 行為明確，不依賴 PK 隱性衝突

## 替代方案考慮

- **保留 user_id PK，不支援多遊戲**：現在夠用，但 VAL/LoL 接入時必炸，技術債大
- **改用 (user_id, game) 複合 PK**：可行，但代理鍵對 Supabase RLS 和 FK 更友好，
  且允許未來按 id 查詢單張卡（分享連結用途）

## 影響

- RLS policy 不受影響（靠 user_id 欄位，非 PK）
- public_profiles view 不受影響（不含 PK 欄位）
- saveDisplayName 需帶 game 以定位 conflict row（已修正）
- getPublicProfile 未來需加 game filter（Known Limitation，留下一 change）

## 相關

- [[REF-019]] profiles schema 遷移路徑
- [[REF-020]] Supabase upsert onConflict 複合鍵
- F-022 PK 換代理鍵零中斷執行記錄
