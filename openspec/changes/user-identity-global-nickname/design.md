---
change: user-identity-global-nickname
artifact: design
---

# Design: user-identity-global-nickname

## Context

OW Social 現在有 `profiles (user_id, game)` 多遊戲角色卡，但缺少「人的層」。
Supabase `auth.users` 有 user_id UUID，是最天然的永久 ID。

## Goals

- G1：建立 `user_profiles` 表，每個用戶一行，持有 `nickname`
- G2：nickname 選填、可改、不唯一（display name 語意，非 username）
- G3：Dev console 第一層改為「人 + 遊戲清單」視圖
- G4：Dev console 第二層：點展開查看各遊戲角色卡詳情
- G5：nickname 搜尋（dev console ilike）
- G6：現有用戶平滑遷移（不破壞既有資料）

## Non-Goals

- 不在廣場名片卡顯示 nickname（後期 change）
- 不做 nickname 唯一性限制（避免跟既有 display_name 衝突）
- 不做 `/player/[nickname]` URL routing（等 nickname 沉澱後再做）
- 不做 onboarding 強制 gate（登入後非強制填 nickname）

## 技術決策

### D1：user_profiles 表 schema

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,                           -- 選填，可 null
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**rationale**：
- 與 `profiles` 表平行（非父子），通過 `user_id` 關聯，避免 FK cascade 問題（REF-019）
- nickname 不加 UNIQUE constraint（避免遷移時重複 display_name 導致 FAIL）
- 不加 `nickname_lower` 計算欄位（ilike 搜尋在 M-scale 資料足夠，本平台不需 GIN index）

### D2：現有用戶遷移策略

```sql
-- Migration 015 遷移段
INSERT INTO user_profiles (user_id, nickname)
SELECT DISTINCT ON (user_id)
  user_id,
  NULLIF(TRIM(display_name), '')
FROM profiles
WHERE display_name IS NOT NULL AND TRIM(display_name) != ''
ORDER BY user_id, updated_at DESC
ON CONFLICT (user_id) DO NOTHING;
```

**rationale**：
- `DISTINCT ON (user_id) ... ORDER BY updated_at DESC` = 最後更新的卡（符合使用者需求）
- `ON CONFLICT DO NOTHING` 確保冪等（migration 可重跑）
- `NULLIF(TRIM(...), '')` 過濾空字串，不把空 display_name 遷成 null nickname

### D3：Dev console 資料層

新 Server Action `getAdminUserList()`：
```typescript
// 回傳每個 user 的 nickname + user_id + games[]
SELECT
  up.user_id,
  up.nickname,
  array_agg(p.game ORDER BY p.updated_at DESC) AS games,
  MAX(p.updated_at) AS last_active
FROM user_profiles up
LEFT JOIN profiles p ON p.user_id = up.user_id
GROUP BY up.user_id, up.nickname
ORDER BY last_active DESC NULLS LAST
LIMIT 50 OFFSET $offset
```

nickname 搜尋：`WHERE up.nickname ILIKE '%' || $query || '%'`

### D4：Dev console UI 架構

```
DeveloperConsoleClient.tsx
  └── Tab: 用戶管理
        UserListTable (新元件)
          ├── 第一層 row: [nickname | user_id | games badges | 展開按鈕]
          └── 第二層 (expandable): UserCardDetail (per-game card info)
```

- 第一層用 shadcn `Table` 元件
- 第二層用 `Collapsible` 元件（shadcn）展開/收合
- 不一次 load 所有卡詳情：展開時才 fetch（call `getAdminUserCards(user_id)`）

### D5：public_profiles view 更新

```sql
-- 加 LEFT JOIN user_profiles 取 nickname
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  p.user_id, p.server, ...existing fields...,
  up.nickname
FROM profiles p
LEFT JOIN user_profiles up ON up.user_id = p.user_id
WHERE p.is_tag_visible = true;
```

### D6：Profile Hub — nickname 編輯

- 現有 Hub 的 `display_name` input 改為連結到 `user_profiles.nickname`
- 不廢除 `profiles.display_name`（保留，但 Hub 的編輯改為操作 `user_profiles`）
- `saveNickname()` Server Action：upsert `user_profiles (user_id)` set `nickname`

## Risks / Trade-offs

| 風險 | 嚴重度 | 緩解 |
|---|---|---|
| migration INSERT 遷移 display_name 可能產生重複 nickname | 低（nickname 不 UNIQUE） | 允許重複，非問題 |
| public_profiles view 加 JOIN 略增查詢成本 | 低 | LEFT JOIN user_profiles 很輕，user_profiles 走 PK index |
| 現有 browse Server Action 需更新 SELECT | 中 | getPublicProfiles() 改 view 後需 re-test |
| Dev console 全量 user list 可能慢 | 低（用戶數 < 1000） | LIMIT 50 + pagination 足夠 |

## 詮釋框架（預先定義）

- migration 015 執行後，`user_profiles` row 數 = 有 display_name 的 profiles 用戶數 → PASS
- Profile Hub 儲存後 DB 查 `user_profiles` 有對應 row → PASS
- Dev console 第一層顯示正確的 nickname/ID/games → PASS
- Dev console 展開後卡詳情資訊正確 → PASS
