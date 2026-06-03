## Why

四個後端積累問題：
1. display_name（Migration 012 已加欄位）但 public_profiles view 未更新，廣場無法顯示顯示名稱
2. unstable_cache 先前因 cache stale 被整個移除，廣場每次載入直打 DB
3. getHeroAlignments() 每次 Component mount 打一次 DB，對幾乎不變的對準資料完全無快取
4. profiles 表無 game 欄位，多遊戲廣場未來擴展的 schema 基礎缺失

## What Changes

- Migration 013：public_profiles view 加 display_name + game；profiles 加 game 欄位 + 2 索引
- browse.ts：unstable_cache 包裝 getPublicProfiles（tag: "public-profiles", revalidate: 60）
- profile.ts：saveProfile/saveDisplayName 成功後 revalidateTag("public-profiles", "max")
- alignmentCache.ts（新增）：module-level 5分鐘 TTL cache
- alignment.ts：加 cache 讀寫
- saveAlignment.ts：成功後 clearAlignmentCache()
- types/card.ts：OWPlayerCard 加 display_name? 和 game?
- OverwatchSquare.tsx：toPlayerCard 加欄位映射；getPublicProfiles 呼叫加 "overwatch" 參數

## Capabilities

### New Capabilities
- browse-server-cache：廣場查詢 60s TTL + saveProfile 後立即失效
- alignment-module-cache：英雄對準參數 5 分鐘 module-level cache
- multi-game-schema：profiles.game 欄位支援未來 LoL/Valorant 資料分區

### Modified Capabilities
- public-profiles-view：新增 display_name、game 欄位
- owplayercard-type：加 display_name?、game? 可選欄位

## Impact

- 新增：`src/app/actions/alignmentCache.ts`
- 新增：`supabase/migrations/013_display_name_game_public.sql`
- 修改：`src/app/actions/alignment.ts`、`saveAlignment.ts`、`browse.ts`、`profile.ts`
- 修改：`src/types/card.ts`、`src/components/square/OverwatchSquare.tsx`
