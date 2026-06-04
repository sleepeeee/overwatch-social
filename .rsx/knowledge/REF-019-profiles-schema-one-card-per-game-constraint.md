---
id: REF-019
type: SURV
title: profiles 表 schema 分析：user_id PK → (user_id, game) unique constraint 遷移路徑
status: active
created: 2026-06-04
tags: [supabase, schema, profiles, multi-game, unique-constraint]
---

## 探索動機

用戶需求：「一個用戶在同一個遊戲只能生成一個角色卡」。
需要確認現有 schema 是否已滿足，以及多遊戲支援的遷移路徑。

## 現有 Schema（Migration 001 + 013）

```sql
-- 001_profiles.sql
CREATE TABLE profiles (
  user_id   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  game      text NOT NULL DEFAULT 'overwatch',  -- 013 加入
  ...
);
```

**關鍵觀察**：
- `user_id` 是 PRIMARY KEY → 每個用戶全域只有 **1 行**，跨所有遊戲共用
- `game` 欄位只是普通欄位，不是 PK 的一部分
- 目前隱性做到「每人只有一張卡」，但無法區分不同遊戲的卡

## 目標 Schema（多遊戲支援 + per-game 唯一）

```sql
-- 需要 Migration 014
ALTER TABLE profiles
  ADD COLUMN id UUID NOT NULL DEFAULT gen_random_uuid();

-- 換掉 PK：user_id 降為 FK，id 升為 PK
ALTER TABLE profiles DROP CONSTRAINT profiles_pkey;
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- 確保 (user_id, game) 唯一（核心需求）
ALTER TABLE profiles ADD CONSTRAINT profiles_user_game_unique
  UNIQUE (user_id, game);
```

## upsert conflict target 變更

**現在**（隱含用 user_id PK）：
```typescript
supabase.from("profiles").upsert({ user_id, ... })
// 若 user_id 已存在 → update；不存在 → insert
```

**改後**（明確指定 conflict columns）：
```typescript
supabase.from("profiles")
  .upsert({ user_id, game, ... }, { onConflict: "user_id,game" })
// 若 (user_id, game) 已存在 → update；不存在 → insert
```

## 受影響的程式碼

| 檔案 | 變更內容 |
|---|---|
| `supabase/migrations/014_*.sql` | 新增 `id` PK，加 UNIQUE(user_id, game) |
| `src/app/actions/profile.ts` `saveProfile` | upsert 加 `onConflict: "user_id,game"`；補 `game` 欄位 |
| `src/app/actions/profile.ts` `getMyProfile` | 加 `.eq("game", game)` filter（預設 'overwatch'）|
| `src/app/actions/profile.ts` `saveDisplayName` | upsert 補 `game` 欄位避免 conflict |
| `src/app/profile/page.tsx` | `getMyProfile` 呼叫傳 game 參數 |
| `public_profiles` view | 不需改（已有 game 欄位，OW 廣場用 `.eq("game","overwatch")` 過濾）|

## 遷移安全性

- 現有 profiles rows 全為 overwatch（因 DEFAULT 'overwatch'）
- 加 `id` 欄位用 DEFAULT gen_random_uuid() → 不破壞現有資料
- 加 UNIQUE(user_id, game)：現有資料已滿足（每人一行、game 唯一）→ 不衝突
- 改 PK 需注意：若有 FK references profiles(user_id) 需一起調整（目前 Migration 查無其他表 FK to profiles）

## 風險

- `saveDisplayName` 目前 upsert `{ user_id, display_name }` — 改 schema 後必須帶 `game` 否則會 insert 新行
- `getMyProfile` `.single()` 若有多行會炸 — 改後需加 game filter 才安全

## 相關檔案

- `supabase/migrations/001_profiles.sql`
- `supabase/migrations/013_display_name_game_public.sql`
- `src/app/actions/profile.ts`
- `src/types/card.ts`（OWPlayerCard.game 欄位）
