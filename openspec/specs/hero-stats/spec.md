# hero-stats Specification

## Purpose
TBD - created by archiving change hero-stats-db-aggregation. Update Purpose after archive.
## Requirements
### Requirement: getHeroStats Server Action 改用 RPC
`developer.ts:getHeroStats()` SHALL 改用 `supabase.rpc('get_hero_stats')` 替代原有的 LIMIT 500 + JS 聚合邏輯。

#### Scenario: Server Action 路徑正常
- WHEN Server Action `getHeroStats()` 被呼叫（已通過 `ensureDeveloper()`）
- THEN 呼叫 `supabase.rpc('get_hero_stats')`
- AND 回傳 `{ heroId: string; count: number }[]`
- AND `count` 為 `Number(row.hero_count)`

#### Scenario: 代碼驗收 LIMIT 移除
- WHEN `rg "\.limit\(500\)" src/app/actions/developer.ts`
- THEN 無命中

#### Scenario: 代碼驗收 JS 聚合移除
- WHEN `rg "forEach.*hero\|hero.*forEach" src/app/actions/developer.ts`
- THEN 無殘留聚合 forEach

### Requirement: developer/page.tsx 移除 inline 聚合
`developer/page.tsx` SHALL 移除 inline JS 聚合邏輯，改用 `supabase.rpc('get_hero_stats')` 直呼（含 error handling 降級），與 page 現有的 `Promise.all` 整合。

#### Scenario: page.tsx 直呼 RPC 並含 error handling
- WHEN `/developer` 頁面載入
- THEN 英雄統計資料來自 `supabase.rpc('get_hero_stats')`（直呼，不經 Server Action）
- AND `heroStatsResult.error ? [] : (...)` 容錯降級確保 page 不 500
- AND 不包含 `.limit(500)` 或 JS forEach 展平邏輯

#### Scenario: 代碼驗收
- WHEN `rg "\.limit\(500\)" src/app/developer/page.tsx`
- THEN 無命中

Note：page.tsx 直呼 RPC（而非透過 Server Action）屬 §6.7 (b) spec/impl 對齊。Server Component 已有 auth 守門，直呼 RPC 加 error handling 是等效且更高效的實作。

### Requirement: 前端展示升至 Top 10
`DeveloperConsoleClient.tsx` SHALL 顯示最多 10 位英雄（原 Top 5）。

#### Scenario: Top 10 展示
- WHEN 開發者查看英雄統計區塊
- THEN 顯示最多 10 位英雄
- AND 排名與 DB 查詢結果一致

