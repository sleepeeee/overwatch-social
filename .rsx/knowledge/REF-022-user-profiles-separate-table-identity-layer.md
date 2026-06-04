---
id: REF-022
type: blog
title: "Supabase 多遊戲平台 user-level identity 層設計模式（DERIV）"
source: DERIV（基於 REF-002/REF-004/REF-019 推導）
created: 2026-06-04
references_to:
  - REF-002
  - REF-004
  - REF-019
  - REF-020
referenced_by:
  - user-identity-global-nickname/design.md
---

## 核心問題

當 `profiles` 表以 `(user_id, game)` 作為多遊戲卡的唯一鍵時，沒有一個地方存放「用戶本身（非遊戲特定）」的資料。

## 推薦模式：平行的 user_profiles 表

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,                 -- user-level 暱稱，非 per-game
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 為什麼是平行表而非在 auth.users 加 metadata

- `auth.users` 是 Supabase 管理的系統表，直接修改 `user_metadata` 有安全問題（REF-013 確認：metadata 可由用戶端直接 updateUser() 修改）
- `user_profiles` 可設獨立 RLS，比 `user_metadata` 更細緻控制
- 業務資料應與認證資料分離（原則）

### 與 profiles 表的關係

- `user_profiles.user_id` = `profiles.user_id`（隱式 1:N 關係）
- 不加 FK `user_profiles → profiles`，讓用戶可在有 user_profiles 但無 profiles 的狀態存在（nickname 先有，卡片後補）

## 遷移策略（DISTINCT ON + ORDER BY updated_at）

```sql
INSERT INTO user_profiles (user_id, nickname)
SELECT DISTINCT ON (user_id)
  user_id, NULLIF(TRIM(display_name), '')
FROM profiles
WHERE display_name IS NOT NULL
ORDER BY user_id, updated_at DESC
ON CONFLICT (user_id) DO NOTHING;
```

`DISTINCT ON` + `ORDER BY updated_at DESC` 確保取每個 user 最新的 display_name（符合「以最後輸入的角色卡為基準」需求）。

## 文獻空白標記

DERIV-2026-06-04：無外部直接文獻覆蓋此 specific pattern；從 Supabase 最佳實踐（REF-002/004）和專案現況（REF-019）推導。
