---
id: ADR-22
title: user_profiles 獨立表（vs auth.users metadata）儲存全域暱稱
change: user-identity-global-nickname
status: Accepted
created: 2026-06-04
references_to: [REF-022, REF-013, REF-004, F-023]
referenced_by: [F-023]
---

## 背景

需要為每個用戶（user_id）儲存一個全域暱稱（nickname），作為跨遊戲的顯示名稱。需要決定儲存位置。

## 決策

**建立獨立的 `user_profiles` 表**（`user_id UUID PRIMARY KEY`，`nickname TEXT nullable`）。

## 方案評估

| 方案 | 評估 | 選否 |
|---|---|---|
| A：user_profiles 獨立表 | 完整 RLS 控制；與 game-specific profiles 解耦；可加任意欄位 | ✅ 選 |
| B：auth.users user_metadata | 用戶端可直接 updateUser() 修改（REF-013 確認，安全問題）| ❌ |
| C：profiles 表加 nickname 欄位 | 跨遊戲共用邏輯不清；(user_id, game) 唯一鍵讓 user-level 資料重複存 N 行 | ❌ |

## 理由

- auth.users user_metadata 可被用戶端偽造（REF-013 確認）
- user_profiles 可設細粒度 RLS（public read；本人 write；developer full）
- 業務資料（nickname）應與認證資料（auth.users）分離

## nickname 設計

- `TEXT nullable`：允許未設定（null = 顯示 user_id）
- 無 UNIQUE constraint：暱稱可重複（user_id 才是真正的 ID）
- 不加 `nickname_lower` 計算欄位：ilike 搜尋在本平台用戶規模下足夠

## 遷移策略

Migration 016 含 `INSERT ... DISTINCT ON (user_id) ... ORDER BY updated_at DESC ON CONFLICT DO NOTHING`：取每個用戶最後更新的 display_name 作為初始 nickname（冪等可重跑）。
