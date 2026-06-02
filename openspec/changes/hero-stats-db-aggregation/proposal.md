---
id: hero-stats-db-aggregation
type: change
status: proposing
created: 2026-06-03
affects_consumers: []
related_claims: []
---

# Proposal: hero-stats-db-aggregation

## Why（動機）

OW Social 開發者後台在 `developer-console-enhancements` change 完成後，英雄流行度統計函式 `getHeroStats()` 存在 **LIMIT 500 + JS 端聚合** 的設計缺陷（詳見 REF-012）。

- 超過 500 名玩家後，後段玩家的英雄選擇完全未計入，統計失真（缺陷 D1）
- 500 筆 row 拉到 edge function 再計數，浪費 DB→edge 頻寬（缺陷 D2）
- 相同有缺陷邏輯在 `developer/page.tsx` 重複出現（缺陷 D3）

**Why now（內部排序）**：developer console 剛完成，英雄統計是後台最脆弱的部分。朋友的 UI 分支持續擴展平台功能，用戶量即將成長，現在修復成本最低（DB function 尚未被其他模組依賴，重構範圍明確）。這是內部排序優化，非外部觸發事件。

**先例缺口**：REF-002~006 涵蓋 SSR / Auth / RLS / RBAC，但無 DB-side aggregation 先例（REF-010/011 為本 change 新建）。

## What Changes

1. **新增 migration 009**：PostgreSQL function `get_hero_stats()` — `unnest + GROUP BY` DB 端聚合，含 `auth.jwt()` 開發者角色確認（defense-in-depth）
2. **修改 `developer.ts:getHeroStats()`**：改用 `supabase.rpc('get_hero_stats')`，移除 LIMIT 500 + JS forEach
3. **修改 `developer/page.tsx`**：移除 inline JS 聚合邏輯，直接 `supabase.rpc('get_hero_stats')`

## Capabilities（修復後）

- 統計覆蓋**全量玩家**（無 LIMIT 截斷）
- DB 端聚合回傳最多 20 row，而非 500 row
- 開發者角色雙層確認：Server Action `ensureDeveloper()` + SQL function `auth.jwt()` check
- 英雄統計展示可升至 Top 10（原為 Top 5，SQL LIMIT 20 支援）

## Impact

- 修改範圍：`supabase/migrations/009_hero_stats_function.sql`（新增）、`src/app/actions/developer.ts`（修改）、`src/app/developer/page.tsx`（修改）
- 無 DB schema 結構變更（只加 function，不加/改 table）
- 無前端視覺破壞性變更（同一個統計區塊，數值更正確）
- 不影響 RLS 現有 policy（`get_hero_stats` 以 SECURITY DEFINER 執行，不觸發 profile row-level policy）

## novelty claim（可偽證）

本 change 新意 = 將 profiles 陣列聚合完全下移至 Supabase DB 端 RPC（`unnest + GROUP BY`）執行，消除 JS 端計數截斷；若 `get_hero_stats()` 無法正確回傳全量降序統計，或 Next.js 端仍需二次排序，則為假。

## 最近鄰 prior work

- REF-006（developer/page.tsx 開發者 UI）：建立了統計顯示的 UI 框架，但未解決聚合層問題
- ADR-04（developer-console 用戶管理 on-demand Server Action）：確立了「不在 component 初始化時預拉所有資料」的原則，本 change 延伸至「不在 edge function 做 DB 端聚合」
