---
id: hero-stats-db-aggregation
type: spec
---

# Spec: hero-stats-db-aggregation

## R1 — PostgreSQL function `get_hero_stats()` 存在且行為正確

**Scenario 1.1 — 基本聚合**
- WHEN: 開發者在 SQL Editor 執行 `SELECT * FROM get_hero_stats()`
- THEN: 回傳 `(hero_id text, hero_count bigint)` 格式的 rows
- AND: 按 hero_count 降序排列
- AND: 最多回傳 20 rows

**Scenario 1.2 — 空陣列不干擾統計**
- WHEN: profiles 表中某 row 的 `selected_heroes = '{}'`
- THEN: 該 row 不產生任何 hero_id 條目（unnest 空陣列回傳空集合）

**Scenario 1.3 — 全量覆蓋（無 LIMIT 截斷）**
- WHEN: profiles 表有 1000 筆 row
- THEN: get_hero_stats() 的計數反映全部 1000 筆（非僅前 500）

## R2 — SECURITY DEFINER + 角色確認

**Scenario 2.1 — developer 可呼叫**
- WHEN: 已登入用戶的 `app_metadata.role === 'developer'` 執行 `supabase.rpc('get_hero_stats')`
- THEN: 成功回傳統計 rows

**Scenario 2.2 — 非 developer 被拒**
- WHEN: 一般 authenticated 用戶（非 developer）直接執行 `supabase.rpc('get_hero_stats')`
- THEN: 回傳 PostgreSQL EXCEPTION（`Permission denied: developer role required`）

## R3 — `developer.ts:getHeroStats()` 改用 RPC

**Scenario 3.1 — Server Action 路徑正常**
- WHEN: Server Action `getHeroStats()` 被呼叫（已通過 `ensureDeveloper()`）
- THEN: 呼叫 `supabase.rpc('get_hero_stats')`，回傳 `{ heroId: string; count: number }[]`
- AND: `count` 為 `Number(row.hero_count)`（bigint → number 安全轉換）
- AND: 不再包含 LIMIT 500 或 JS forEach 聚合邏輯

## R4 — `developer/page.tsx` 移除 inline JS 聚合

**Scenario 4.1 — page.tsx 直接 RPC**
- WHEN: `/developer` 頁面載入（開發者已通過 server-side redirect 守門）
- THEN: `Promise.all` 中直接呼叫 `supabase.rpc('get_hero_stats')`
- AND: 不包含 `select("selected_heroes").limit(500)` 的 query

## R5 — 前端展示升至 Top 10

**Scenario 5.1 — DeveloperConsoleClient 顯示 Top 10**
- WHEN: 開發者查看英雄統計區塊
- THEN: 顯示最多 10 位英雄（原 Top 5）
- AND: 排名正確（與 SQL 查詢結果一致）

## 驗收門檻（§6.7 審查用）

- [ ] migration 009 SQL 在 Supabase SQL Editor 執行無 error
- [ ] 非 developer 用戶 RPC 呼叫被拒
- [ ] `/developer` 頁面英雄統計區塊正確顯示
- [ ] TypeScript 編譯無 error（`npx tsc --noEmit`）
- [ ] `developer.ts` 和 `developer/page.tsx` 均不再含 `.limit(500)` 和 JS forEach 聚合
