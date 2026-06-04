---
id: F-023
title: user_profiles 身份層設計：nickname ≠ unique ID，user_id UUID = 永久 ID
change: user-identity-global-nickname
created: 2026-06-04
references_to: [ADR-22, REF-022, REF-013]
referenced_by: [ADR-22]
---

## 發現摘要

在設計全域暱稱功能時，確認了一個關鍵設計決策：**nickname（暱稱）不應作為唯一識別碼（ID）**，真正的永久 ID 是 Supabase `auth.users.user_id` UUID。

## 根因分析

### 為什麼 nickname 不能是 unique ID

1. **REF-013 確認**：Supabase user_metadata 可由用戶端直接 `updateUser()` 修改，不安全
2. **使用者需求**：「可以想怎麼改就怎麼改」——暱稱允許任意修改，不能是唯一識別碼
3. **遷移問題**：現有 profiles.display_name 可能有重複值，加 UNIQUE constraint 會導致遷移失敗
4. **Discord 模式對比**：Discord 允許重複顯示名稱（display_name），真正 ID 是 snowflake 數字

### 架構決策

- `user_id` UUID = 永久不變的平台 ID（Supabase 辦帳號時自動生成）
- `nickname` = 選填、可改、非唯一的顯示名稱（human-readable label）
- Dev console 顯示格式：`nickname（若有）+ user_id（完整）`

## 影響

- `user_profiles.nickname` 無 UNIQUE constraint（設計選擇，非遺漏）
- Profile Hub 的暱稱 input 儲存到 `user_profiles`（非 `profiles.display_name`）
- 未設暱稱的用戶在 dev console 顯示「未設定暱稱」+ 完整 user_id
