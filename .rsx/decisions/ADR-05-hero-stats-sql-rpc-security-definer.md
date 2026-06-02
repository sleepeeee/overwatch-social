---
id: ADR-05
title: "英雄統計採 SQL function SECURITY DEFINER + LATERAL unnest（vs Server Action 端聚合）"
status: Accepted
change: hero-stats-db-aggregation
date: 2026-06-03
references_to: [REF-010, REF-011, F-005]
referenced_by: []
---

## 決策

`get_hero_stats()` 以 PostgreSQL SQL function 實作，採 SECURITY DEFINER 繞過 RLS、LATERAL unnest 展開 `selected_heroes` 陣列、`COUNT(DISTINCT user_id)` 計唯一玩家數。呼叫方：`developer/page.tsx` 透過 `supabase.rpc('get_hero_stats')` 直呼，不經 Server Action 包裝。

實作：

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

## 考量選項

| 選項 | 說明 | 拒絕原因 |
|---|---|---|
| A（選定）| SQL function SECURITY DEFINER + LATERAL unnest | DB 端聚合；只回傳 20 rows；SECURITY DEFINER 繞過 RLS 讀全表 |
| B | Server Action 拉全量再聚合（舊做法） | LIMIT 500 截斷缺陷（D1）；JS 端聚合低效（D2）；須搭配 `limit` 或 `count` 確認全量，複雜度高 |
| C | RPC + plpgsql + auth.jwt() role check | 加入 SQL 層角色確認；但 §6.7 spec/impl 漂移分析後，Server Action `ensureDeveloper()` 已是充分授權邊界，SQL 層額外 check 反而造成 spec 矛盾 |

## 理由

1. **效率**：DB 端 unnest + GROUP BY 在 PostgreSQL 比 JS 端迴圈快；僅回傳最多 20 rows vs 原本 500 rows。
2. **正確性**：SECURITY DEFINER 繞過 RLS，確保統計到全量玩家（不僅是本人 row）。COUNT(DISTINCT user_id) 防止 selected_heroes 重複元素導致計數膨脹。
3. **授權模型**：主授權由 `developer/page.tsx` Server Component redirect 守門（非 developer 在 Server Component 層即被導回），無 anon 可到達此 RPC 的路徑。GRANT EXECUTE TO authenticated（非 anon）為最小權限。
4. **簡潔性**：不繞 Server Action 額外包裝，減少一層 indirection；§6.7 分類為 (b) spec/impl 漂移，實作更健壯，spec 已同步對齊。

## 後續影響

- 未來新增後台統計（段位分布、Tag 使用率等）可參照此 pattern 建新 SQL function。
- plpgsql + auth.jwt() role check 的雙層防護方案保留於 REF-011 作為 defense-in-depth 選項，本 change 不採用但記錄供未來參考。
- D3 重複呼叫點問題已解（兩處統一用 RPC）；建議未來後台統計統一透過 Server Action 封裝以避免邏輯分散。
