---
id: hero-stats-db-aggregation
type: tasks
---

# Tasks: hero-stats-db-aggregation

## Task 1 — 建立 migration 009（DB function）

- [ ] 建立 `supabase/migrations/009_hero_stats_function.sql`
- [ ] 內容：`get_hero_stats()` plpgsql function（unnest + GROUP BY + auth.jwt() role check + SECURITY DEFINER）
- [ ] `GRANT EXECUTE ON FUNCTION get_hero_stats() TO authenticated`
- [ ] 在 Supabase SQL Editor 手動執行並確認無 error（**驗收：`SELECT * FROM get_hero_stats()` 回傳正確 rows**）
- [ ] 驗收：以非 developer 用戶呼叫 `supabase.rpc('get_hero_stats')` 確認被拒

## Task 2 — 修改 `developer.ts:getHeroStats()`

- [ ] 移除 `.from("profiles").select("selected_heroes").limit(500)` 查詢
- [ ] 移除 JS `Map` 聚合 forEach 邏輯
- [ ] 改為 `const { data, error } = await supabase.rpc('get_hero_stats')`
- [ ] 回傳型別轉換：`(data ?? []).map(row => ({ heroId: row.hero_id, count: Number(row.hero_count) }))`
- [ ] 驗收：`getHeroStats()` function 不含 `.limit(500)`

## Task 3 — 修改 `developer/page.tsx`（移除 inline 聚合）

- [ ] 找到 `page.tsx` 內的 inline JS 聚合邏輯（`select("selected_heroes").limit(500)` + forEach）
- [ ] 替換為 `supabase.rpc('get_hero_stats')`（直呼，不經 Server Action）
- [ ] 調整 `Promise.all` 內的 heroStats 取得方式
- [ ] 驗收：`developer/page.tsx` 不含 `.limit(500)`

## Task 4 — 前端展示升至 Top 10

- [ ] 找到 `DeveloperConsoleClient.tsx` 的英雄統計渲染區塊
- [ ] 移除或調整 `.slice(0, 5)`（改為 `.slice(0, 10)` 或直接用全部 20 rows）
- [ ] 確認 UI 正確顯示（標題/計數格式不變，只是顯示更多）

## Task 5 — TypeScript + 整合驗收

- [ ] `npx tsc --noEmit` 無 error
- [ ] 造訪 `/developer`，確認英雄統計區塊正確顯示（Top 10 排名）
- [ ] 確認統計與 Supabase SQL Editor `SELECT * FROM get_hero_stats()` 結果一致
