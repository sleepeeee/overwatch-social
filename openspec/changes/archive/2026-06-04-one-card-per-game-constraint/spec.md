# Spec: one-card-per-game-constraint

## File 1: supabase/migrations/014_one_card_per_game.sql（新建）

```sql
-- ============================================================
-- Migration 014: profiles 表 PK 重構 + one-card-per-game 約束
-- 目的：引入代理鍵 id，以 UNIQUE(user_id, game) 替代隱性的 user_id PK 唯一性
-- 資料安全：現有行 game 全為 'overwatch'，無衝突；id 欄位自動填 UUID
-- ============================================================

-- 1. 加代理鍵
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS id UUID NOT NULL DEFAULT gen_random_uuid();

-- 2. 換 PK：移除 user_id PK，改用 id
ALTER TABLE profiles DROP CONSTRAINT profiles_pkey;
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- 3. 加 (user_id, game) unique constraint
ALTER TABLE profiles
  ADD CONSTRAINT profiles_user_game_unique UNIQUE (user_id, game);

-- 4. 加 user_id 索引（原 PK 自帶索引，換 PK 後需手動補）
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles (user_id);
```

## File 2: src/app/actions/profile.ts（修改）

### `getMyProfile` 加 game 參數

```typescript
// Before
export async function getMyProfile(): Promise<OWPlayerCard | null> {
  ...
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

// After
export async function getMyProfile(game = 'overwatch'): Promise<OWPlayerCard | null> {
  ...
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .eq("game", game)
    .single();
```

### `saveProfile` 加 onConflict + game 欄位

```typescript
// Before
const { error } = await supabase
  .from("profiles")
  .upsert({
    user_id: userId,
    server: card.server,
    ...
  });

// After
const { error } = await supabase
  .from("profiles")
  .upsert(
    {
      user_id: userId,
      game: card.game ?? 'overwatch',
      server: card.server,
      ...
    },
    { onConflict: "user_id,game" }
  );
```

### `saveDisplayName` 加 game + onConflict

```typescript
// Before
const { error } = await supabase
  .from("profiles")
  .upsert({ user_id: user.id, display_name: displayName.trim() });

// After
const { error } = await supabase
  .from("profiles")
  .upsert(
    { user_id: user.id, game: 'overwatch', display_name: displayName.trim() },
    { onConflict: "user_id,game" }
  );
```

## File 3: src/app/profile/page.tsx（修改）

```typescript
// Before（約 L178）
getMyProfile().then(profile => {

// After
getMyProfile("overwatch").then(profile => {
```

## Known Limitations（超出本次 scope）

- `getPublicProfile(userId)` 目前用 `.single()` 查 public_profiles。本次 change 後若未來有多遊戲卡片，`/player/[id]` 頁會炸（PGRST116）。解法：`getPublicProfile(userId, game = 'overwatch')`，留給下一個 change 處理。
- VAL/LoL `saveProfile` 未來要接入時，需傳正確 game 值（'valorant' / 'lol'），本次 hardcode 'overwatch' 不影響。

## 驗收條件

1. Migration 執行後，Supabase `profiles` 表有 `id` 欄位且為 PK
2. `profiles_user_game_unique` constraint 存在
3. 用現有帳號儲存名片：DB profiles 行數不增加（仍是 update）
4. 強制 insert 重複 (user_id, game) → DB 回 23505 unique violation
5. `getMyProfile("overwatch")` 返回正確資料，無 PGRST116 錯誤
