---
id: hero-stats-db-aggregation/hero-stats
type: spec
delta: replace
---

# Spec: hero-stats — DB 端聚合（替代 JS LIMIT 500 模式）

## ADDED Requirements

### Requirement: get_hero_stats PostgreSQL function
系統 SHALL 提供 `get_hero_stats()` PostgreSQL function，使用 LATERAL unnest + GROUP BY 在 DB 端完成英雄統計聚合，以 `supabase.rpc()` 呼叫。

#### Scenario: 基本聚合正確性
- WHEN authenticated 用戶透過 `supabase.rpc('get_hero_stats')` 呼叫
- THEN 回傳 `(hero_id text, hero_count bigint)` 格式的 rows
- AND 按 hero_count 降序排列
- AND 最多回傳 20 rows

#### Scenario: 空陣列不干擾統計
- WHEN profiles 表中某 row 的 `selected_heroes = '{}'`
- THEN 該 row 不產生任何 hero_id 條目

#### Scenario: 全量覆蓋無截斷
- WHEN profiles 表有超過 500 筆 row
- THEN 統計計數反映全部 row（LATERAL unnest 無 LIMIT 截斷輸入）

#### Scenario: anon 無法呼叫
- WHEN anon（未登入）用戶嘗試呼叫 `supabase.rpc('get_hero_stats')`
- THEN 回傳 permission denied（GRANT 限 authenticated）

#### Scenario: 非 developer authenticated 可呼叫（接受的 trade-off）
- WHEN 一般 authenticated 用戶（非 developer）直接呼叫 `supabase.rpc('get_hero_stats')`
- THEN 允許回傳統計資料（英雄流行度屬非敏感 aggregate）
- AND 主要授權邊界在 Server Action `ensureDeveloper()`（`/developer` 路由守門）
- AND 此為已接受的設計 trade-off，記錄於 design.md D1

### Requirement: search_path 安全固定
Function SHALL 包含 `SET search_path = public` 防止 schema 注入攻擊。

#### Scenario: SQL DDL 含 SET search_path
- WHEN migration 009 執行後
- THEN `pg_proc.prosettings` 包含 `search_path=public` 設定
- AND Function 以 `SECURITY DEFINER` 定義

## MODIFIED Requirements

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
`developer/page.tsx` SHALL 改用 `getHeroStats()` Server Action 替代 inline JS 聚合邏輯。

#### Scenario: page.tsx 呼叫 Server Action
- WHEN `/developer` 頁面載入
- THEN 英雄統計資料來自 `getHeroStats()` Server Action
- AND 不包含 `.limit(500)` 或 JS forEach 展平邏輯

#### Scenario: 代碼驗收
- WHEN `rg "\.limit\(500\)" src/app/developer/page.tsx`
- THEN 無命中

### Requirement: 前端展示升至 Top 10
`DeveloperConsoleClient.tsx` SHALL 顯示最多 10 位英雄（原 Top 5）。

#### Scenario: Top 10 展示
- WHEN 開發者查看英雄統計區塊
- THEN 顯示最多 10 位英雄
- AND 排名與 DB 查詢結果一致
