# Design: one-card-per-game-constraint

## Schema 設計

### 現有結構（簡化）

```sql
CREATE TABLE profiles (
  user_id  uuid PRIMARY KEY REFERENCES auth.users(id),
  game     text NOT NULL DEFAULT 'overwatch',
  ...
);
```

### 目標結構

```sql
CREATE TABLE profiles (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),  -- 新增代理鍵
  user_id  uuid NOT NULL REFERENCES auth.users(id),     -- 降為業務鍵
  game     text NOT NULL DEFAULT 'overwatch',
  ...
  CONSTRAINT profiles_user_game_unique UNIQUE (user_id, game)
);
```

## Migration 014 策略

非破壞性遷移（3 個 ALTER 步驟）：

```sql
-- 1. 加代理鍵（現有行自動填 UUID）
ALTER TABLE profiles ADD COLUMN id UUID NOT NULL DEFAULT gen_random_uuid();

-- 2. 換 PK（DROP 舊 user_id PK → ADD 新 id PK）
ALTER TABLE profiles DROP CONSTRAINT profiles_pkey;
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- 3. 加 unique constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_user_game_unique
  UNIQUE (user_id, game);
```

**資料安全**：現有 4 rows 全為 `game='overwatch'`，加 UNIQUE 後不衝突。

## Server Action 設計

### `saveProfile(card, game = 'overwatch')`

```typescript
// 改：明確 conflict target
await supabase.from("profiles").upsert(
  { user_id: userId, game: card.game ?? 'overwatch', ...fields },
  { onConflict: "user_id,game" }
);
```

### `getMyProfile(game = 'overwatch')`

```typescript
// 改：加 game filter，避免 multi-row 後 .single() 炸
await supabase.from("profiles")
  .select("*")
  .eq("user_id", user.id)
  .eq("game", game)  // 新增
  .single();
```

### `saveDisplayName(displayName)`

```typescript
// 改：upsert 必須帶 game，否則 (user_id, game) conflict 無法定位
await supabase.from("profiles").upsert(
  { user_id: user.id, game: 'overwatch', display_name: displayName.trim() },
  { onConflict: "user_id,game" }
);
```

## Profile Page 呼叫點

`profile/page.tsx` 的 `getMyProfile()` 呼叫改為 `getMyProfile("overwatch")`。
目前頁面只服務 OW（activeSection = "ow-edit"），hardcode 'overwatch' 即可。

## RLS Policy 影響

RLS policy 全用 `(SELECT auth.uid()) = user_id` 欄位比對，不依賴 PK。
Migration 改 PK 後，RLS **不需要修改**。

## public_profiles view 影響

view 選 `user_id`, `game` 等欄位，不依賴 PK。
廣場查詢已有 `.eq("game", "overwatch")` filter。
**view 不需要修改**。
