---
id: ADR-20
title: 趁早在 profiles 表加 game 欄位（early schema preparation），避免未來大批量 backfill
status: Accepted
date: 2026-06-04
references_to: []
referenced_by: []
---

## 背景

`profiles` 表目前無 `game` 欄位。目前只有 Overwatch 廣場接真實資料，但 LoLSquare / ValorantSquare 規劃接入真實後端時，需要 DB 層區分玩家所屬遊戲。若等到真正需要時才加欄位，屆時需要對所有現有資料執行 backfill migration。

## 決策

在 migration 013 加入：

```sql
ALTER TABLE profiles ADD COLUMN game TEXT NOT NULL DEFAULT 'overwatch';
CREATE INDEX idx_profiles_game ON profiles(game);
CREATE INDEX idx_profiles_game_updated ON profiles(game, updated_at DESC);
```

現有資料透過 `DEFAULT 'overwatch'` 自動 backfill，零手動操作。`OverwatchSquare` 呼叫 `getPublicProfiles` 加第四參數 `"overwatch"` 篩選。

## 替代方案評估

| 方案 | 評估 | 捨棄理由 |
|---|---|---|
| 等到真正需要時再加 | 延後 schema 變更 | 屆時 backfill 需處理所有現有 profiles；索引建立在大表上更慢 |
| 早加（選定） | 趁用戶少時 migration | DEFAULT 'overwatch' 零成本 backfill；複合索引為未來分遊戲分頁查詢鋪路 |
| 分成多張表（per-game profiles） | 正規化更強 | 過度設計；目前遊戲欄位只是篩選條件，不需獨立表 |

## 理由

- 現在 profiles 資料量小，migration 成本接近零
- `DEFAULT 'overwatch'` 確保現有資料自動歸類，不需手動 UPDATE
- 複合索引 `(game, updated_at DESC)` 直接支援未來「按遊戲 + 最近更新分頁」查詢模式
- `public_profiles` view 同步加入 `game` 欄位，OWPlayerCard type 加 `game?` 可選欄位

## 影響範圍

- 新增 migration：`supabase/migrations/013_display_name_game_public.sql`
- 修改：`src/types/card.ts`（OWPlayerCard 加 `game?`）
- 修改：`src/components/square/OverwatchSquare.tsx`（getPublicProfiles 加 "overwatch" 第四參數）
- 修改：`src/app/actions/browse.ts`、`profile.ts`（rowToCard 加 game 映射）
