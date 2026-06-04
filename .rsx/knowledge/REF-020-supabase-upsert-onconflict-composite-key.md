---
id: REF-020
type: docs
title: Supabase JS Client — upsert onConflict 複合鍵使用方式
status: active
created: 2026-06-04
tags: [supabase, upsert, composite-key, onConflict]
source: https://supabase.com/docs/reference/javascript/upsert
---

## 核心用法

```typescript
// 單欄 conflict（PK 是單一欄位）
supabase.from("profiles").upsert({ user_id, ... })
// 等同於 onConflict: "user_id"（PK 預設）

// 複合 conflict（UNIQUE constraint 是 (user_id, game)）
supabase.from("profiles")
  .upsert(
    { user_id, game, ... },
    { onConflict: "user_id,game" }
  )
```

## 重要注意

- `onConflict` 字串裡的欄位名稱必須與 DB constraint/index 的欄位名**完全一致**（逗號分隔，無空格）
- upsert 必須帶入 conflict columns 的值，否則 Postgres 無法定位衝突行
- 若 UNIQUE constraint 名稱是 `profiles_user_game_unique`，onConflict 仍寫欄位名而非 constraint 名

## Supabase Migration 宣告方式

```sql
-- 加 UNIQUE constraint（不改 PK）
ALTER TABLE profiles
  ADD CONSTRAINT profiles_user_game_unique UNIQUE (user_id, game);

-- 或透過 CREATE UNIQUE INDEX（等效）
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_game
  ON profiles (user_id, game);
```

## 相關知識點

- [[REF-019]] profiles schema 遷移路徑
