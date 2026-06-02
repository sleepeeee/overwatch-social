---
id: F-005
title: "LIMIT 500 + JS 端聚合缺陷確認：玩家數 > 500 後英雄流行度排名失真"
status: confirmed
change: hero-stats-db-aggregation
date: 2026-06-03
references_to: [REF-010, REF-011, REF-012]
referenced_by: [ADR-05]
supporting_refs: [REF-012]
---

## 結論 / 數據

- **根因**：`developer.ts:getHeroStats()` 與 `developer/page.tsx` 的 `Promise.all` 區塊各自獨立存在相同的 LIMIT 500 截斷 + JS `Map` 聚合邏輯（缺陷 D1/D2/D3，詳見 REF-012）。
- **量化影響**：
  - D1 截斷：玩家數超過 500 時，後段玩家的英雄選擇完全不納入統計，排名失真。每位玩家最多 3 個英雄 → 實際展開 row 數最多僅 1,500，vs 正確實作應掃全表。
  - D2 效率：500 rows × 平均 ~2 英雄選擇 = ~1,000 個字串拉到 edge function 端，DB 端可用 `unnest + COUNT(DISTINCT user_id)` 在 20 rows 完成聚合。
  - D3 重複：兩處相同邏輯需同步修復，漏修一處即殘留缺陷。
- **修復路徑**：migration 009 建立 `get_hero_stats()` SQL function（SECURITY DEFINER + `unnest(selected_heroes) + COUNT(DISTINCT user_id)`），兩處呼叫點統一改為 `supabase.rpc('get_hero_stats')`；`DeveloperConsoleClient.tsx` 由 Top 5 升至 Top 10。
- **驗收**：`npx tsc --noEmit` 無 error；`SELECT * FROM get_hero_stats()` 回傳正確 rows；UI Top 10 與 SQL Editor 直查一致（commit a7c8573）。

## 與既有 REF 一致或矛盾

- 與 REF-012（缺陷審計）完全一致：D1/D2/D3 三缺陷均已在 apply 階段確認。
- 與 REF-010（unnest + GROUP BY 模式）一致：DB 端聚合確認可行，`LIMIT 20` 大幅減少傳輸量。
- 與 REF-011（SECURITY DEFINER + JWT 角色確認）一致：`GRANT EXECUTE TO authenticated` + Server Action `ensureDeveloper()` 雙層授權已驗證。

## 對後續影響

- 英雄流行度統計現在可正確反映全量玩家選擇，後台數據可信度提升。
- `get_hero_stats()` RPC 是可複用的 DB 端聚合 pattern，未來新增「英雄勝率」「段位分布」等統計可照此模式建新 function。
- 雙重呼叫點缺陷（D3）提示：下次新增後台統計功能時，應優先統一由 Server Action 封裝，避免 page.tsx 直呼 RPC 造成邏輯分散（已記入 ADR-05 考量）。
