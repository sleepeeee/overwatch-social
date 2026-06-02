# 歸檔報告：hero-stats-db-aggregation

**歸檔日期**：2026-06-03  
**Change**：`openspec/changes/archive/2026-06-02-hero-stats-db-aggregation/`

---

## 30 秒速覽

| 項目 | 內容 |
|---|---|
| **解決了什麼** | developer 後台英雄流行度統計 LIMIT 500 截斷 + JS 端聚合，>500 玩家後統計失真 |
| **核心修改** | `migration 009`：PostgreSQL `get_hero_stats()` RPC function；`developer.ts` 改 RPC；`developer/page.tsx` 直呼 RPC |
| **意外發現** | `profile/page.tsx` 有未定義型別 `ProfileUpdatePayload`/`saveCardToDatabase`（friend 分支引入，順手修復）；E2E spec 有 merge conflict markers |
| **下一步** | 在 Supabase SQL Editor 手動執行 migration 009 以更新線上 function（`COUNT DISTINCT` + `search_path` 修正）|

---

## 完整版

### A. 問題背景

`developer-console-enhancements` change 完成後，`developer.ts:getHeroStats()` 和 `developer/page.tsx` 均有相同缺陷：
- LIMIT 500：超過 500 名玩家後統計失真（F-005）
- JS 端 forEach 聚合：浪費 DB→edge 頻寬
- 相同邏輯重複兩處

### B. 架構決策（ADR-05）

| 決策 | 選擇 | 理由 |
|---|---|---|
| 聚合位置 | PostgreSQL `SECURITY DEFINER` function | DB 端聚合，edge function 只收結果 row |
| 展開方式 | LATERAL cross join `FROM profiles, unnest(selected_heroes) AS h_id` | 避免 SRF in GROUP BY 語意問題 |
| 計數語意 | `COUNT(DISTINCT profiles.user_id)` | 「選擇此英雄的唯一玩家數」，防止重複 hero_id 膨脹 |
| 授權模式 | `plpgsql` + `auth.jwt()` role check + `REVOKE/GRANT authenticated` | Defense-in-depth：三層保護 |
| search_path | `SET search_path = public` | 防 schema 注入攻擊 |

### C. §6.7 spec/impl 漂移記錄

兩個分類 (b) 漂移：
1. **page.tsx 直呼 RPC**（非 Server Action）：實作更直接，有正確 error handling，spec 已對齊
2. **migration JWT check 比 spec 更嚴格**：implementation blocks non-developer，spec 更新為「被 JWT check 拒絕」

### D. propose 階段 §6.5 記錄

Codex §6.5 連續 5 輪 5/10 FAIL，Gemini §6.5 最後 2 輪 10/10 PASS。  
依全域規則（≥3 次連續 FAIL）套用 §6.3 Option C：接受並記錄。  
所有 Codex 識別問題均已修正（spec 格式、LATERAL unnest、search_path、artifact sync、COUNT DISTINCT 等）。

### E. 額外修復（本 change 範疇外）

- `profile/page.tsx`：移除 friend 分支引入的 `ProfileUpdatePayload` + `saveCardToDatabase` 未定義引用
- `tests/e2e/developer-capture-meter.spec.ts`：修復 merge conflict markers（採用 incoming 版本）

### F. 驗收狀態

- `npx tsc --noEmit`：無 error ✓
- `openspec validate --strict`：PASS ✓
- Gemini §6.7：10/10 ✓
- rg LIMIT 500 驗收：無命中 ✓

### G. 待辦（使用者需手動執行）

**重要**：migration 009 已有舊版本在線上 Supabase（使用 `COUNT(*)`）。需在 Supabase SQL Editor 重新執行 `009_hero_stats_function.sql` 以更新為 `COUNT(DISTINCT profiles.user_id)` + 正確的 `search_path`。

```sql
-- 在 Supabase Dashboard SQL Editor 執行：
-- 複製 supabase/migrations/009_hero_stats_function.sql 全文貼上執行
```
