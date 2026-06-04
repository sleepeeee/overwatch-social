---
id: REF-021
type: docs
title: PostgreSQL — 從單欄 PK 遷移到代理 PK + 複合 UNIQUE 的安全步驟
status: active
created: 2026-06-04
tags: [postgresql, migration, primary-key, unique-constraint, supabase]
---

## 問題情境

現有表：`user_id UUID PRIMARY KEY`（業務鍵同時是 PK）
目標：讓 `(user_id, game)` 成為 unique 約束，同時引入代理鍵 `id UUID PK`

## 安全遷移步驟（PostgreSQL）

```sql
-- Step 1：加代理鍵（非破壞，現有行自動填 UUID）
ALTER TABLE profiles
  ADD COLUMN id UUID NOT NULL DEFAULT gen_random_uuid();

-- Step 2：換掉 PK（先移除舊 PK constraint，再加新的）
ALTER TABLE profiles DROP CONSTRAINT profiles_pkey;
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- Step 3：保留 user_id 業務唯一性
ALTER TABLE profiles ADD CONSTRAINT profiles_user_game_unique
  UNIQUE (user_id, game);

-- Step 4：保留 user_id → auth.users FK（不受 PK 替換影響，FK 靠 user_id 欄位本身）
-- 無需額外操作，FK 不依賴 PK
```

## Supabase 注意事項

- Supabase RLS policy 用 `(SELECT auth.uid()) = user_id` → 不依賴 PK，無需修改
- public_profiles view 選 `user_id` 欄位 → 不依賴 PK，無需修改
- `supabase.from().select().eq("user_id", ...).single()` → 若一個 user 有多行需改為 `.eq("game", ...)` 組合

## 更簡單的替代方案（若不需要代理鍵）

若不要改 PK，只加 `UNIQUE(user_id, game)` 但保持 `user_id` 為 PK：

```sql
-- 不可行！user_id 已是 PK（唯一），再加 UNIQUE(user_id, game) 是多餘的。
-- 因為 PK 已保證 user_id 唯一，(user_id, game) 也一定唯一。
-- 但這代表每人仍只能有一行（一張卡，對所有遊戲共用）。
```

**結論**：若要每人每遊戲一張卡（多行），必須改 PK 結構。

## 相關知識點

- [[REF-019]] profiles schema 遷移路徑
- [[REF-020]] Supabase upsert onConflict 複合鍵
