---
id: hero-stats-db-aggregation
type: tasks
---

# Tasks: hero-stats-db-aggregation

## Task 1 — 建立 migration 009（DB function）

- [x] 建立 `supabase/migrations/009_hero_stats_function.sql`，內容：

```sql
CREATE OR REPLACE FUNCTION get_hero_stats()
RETURNS TABLE(hero_id text, hero_count bigint)
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h_id, COUNT(DISTINCT profiles.user_id)::bigint AS hero_count
  FROM profiles,
       unnest(selected_heroes) AS h_id
  GROUP BY h_id
  ORDER BY 2 DESC
  LIMIT 20;
$$ LANGUAGE sql;

REVOKE ALL ON FUNCTION get_hero_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_hero_stats() TO authenticated;
```

注：`COUNT(DISTINCT user_id)` 統計「選擇此英雄的唯一玩家數」，防止 selected_heroes 重複元素導致計數膨脹（Gemini N2 建議，語意更精確）。

- [x] 在 Supabase SQL Editor 手動執行，確認無 error
- [x] 驗收：`SELECT * FROM get_hero_stats()` 以 developer session 呼叫回傳正確 rows

## Task 2 — 修改 `developer.ts:getHeroStats()`

- [x] 移除 `.from("profiles").select("selected_heroes").limit(500)` 查詢
- [x] 移除 JS `Map` 聚合 forEach 邏輯（包含 `selected_heroes` 展平 forEach）
- [x] 改為 `const { data, error } = await supabase.rpc('get_hero_stats')`
- [x] 回傳轉換：`(data ?? []).map(row => ({ heroId: row.hero_id, count: Number(row.hero_count) }))`
- [x] **rg 驗收**：`rg "\.limit\(500\)" src/app/actions/developer.ts` 無命中
- [x] **rg 驗收**：`rg "forEach" src/app/actions/developer.ts` 無殘留聚合 forEach

## Task 3 — 修改 `developer/page.tsx`（改用 Server Action）

- [x] 找到 `page.tsx` 內的 inline JS 聚合邏輯（`select("selected_heroes").limit(500)` + forEach）
- [x] 替換為呼叫 `getHeroStats()` Server Action（import 自 `@/app/actions/developer`）
- [x] 調整 `Promise.all` 內的 heroStats 取得方式，加錯誤降級（`heroStats || []`）
- [x] **rg 驗收**：`rg "\.limit\(500\)" src/app/developer/page.tsx` 無命中
- [x] **rg 驗收**：`rg "selected_heroes" src/app/developer/page.tsx` 無 JS 展平邏輯

## Task 4 — 前端展示升至 Top 10

- [x] 找到 `DeveloperConsoleClient.tsx` 的英雄統計渲染區塊
- [x] 移除 `.slice(0, 5)` 或改為 `.slice(0, 10)`
- [x] 確認 UI 顯示最多 10 位英雄（標題/計數格式不變）

## Task 5 — TypeScript + 整合驗收

- [x] `npx tsc --noEmit` 無 error
- [x] 造訪 `/developer`，確認英雄統計區塊正確顯示（Top 10 排名）
- [x] 確認統計與 Supabase SQL Editor `SELECT * FROM get_hero_stats()` 結果一致
