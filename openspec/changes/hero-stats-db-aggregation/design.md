---
id: hero-stats-db-aggregation
type: design
---

# Design: hero-stats-db-aggregation

## Context

OW Social 的開發者後台（`/developer`）顯示英雄流行度 Top 5 統計。現有實作在 Server Action 中拉取最多 500 筆 profiles row，再在 JavaScript 層展開 `selected_heroes[]` 並計數。DB 端有 RLS policy 限制一般用戶只能讀自己的 row；因此統計必須使用 SECURITY DEFINER function 或 service role，才能跨所有用戶聚合。

## Goals

- G1：統計覆蓋全量玩家，無截斷
- G2：聚合在 DB 端完成，edge function 只收結果 row
- G3：保持開發者角色雙層授權（Server Action 層 + DB function 層）
- G4：消除重複邏輯（`developer.ts` 和 `developer/page.tsx` 兩份相同缺陷代碼）

## Non-Goals

- NG1：不修改 `profiles` 表結構（只加 function）
- NG2：不改動前端 UI 佈局（只更新統計數值）
- NG3：不處理 hero stats 的快取 / TTL（超出本 change 範圍）

## 現況問題分析（REF-012）

| 缺陷 | 位置 | 影響 |
|---|---|---|
| D1：LIMIT 500 截斷 | `developer.ts:getHeroStats()` | >500 玩家後統計失真 |
| D2：JS 端聚合 | `developer.ts:getHeroStats()` | 浪費 DB→edge 頻寬 |
| D3：重複邏輯 | `developer/page.tsx` inline | 兩處均有 D1/D2 缺陷 |

## 架構決策

### D1：聚合位置 — PostgreSQL function（採用）

**選項 A（採用）**：PostgreSQL `get_hero_stats()` function（`unnest + GROUP BY`，SECURITY DEFINER）+ `supabase.rpc()`

```sql
CREATE OR REPLACE FUNCTION get_hero_stats()
RETURNS TABLE(hero_id text, hero_count bigint) AS $$
DECLARE user_role text;
BEGIN
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') INTO user_role;
  IF user_role != 'developer' THEN
    RAISE EXCEPTION 'Permission denied: developer role required';
  END IF;
  RETURN QUERY
    SELECT unnest(selected_heroes)::text, COUNT(*)
    FROM profiles GROUP BY 1 ORDER BY 2 DESC LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**選項 B（拒絕）**：`service_role` key 在 Server Action 直查，移除 LIMIT

- 拒絕理由：service_role key 不應出現在 Next.js edge runtime（暴露風險）

**Rationale 表**：

| 選擇 | 依據 |
|---|---|
| PostgreSQL unnest + GROUP BY | REF-010（Postgres array aggregation 標準模式）|
| SECURITY DEFINER + auth.jwt() | REF-011（Supabase RPC security pattern）|
| GRANT TO authenticated（非 anon）| REF-005（最小權限原則）|

### D2：developer/page.tsx 改用何種入口

**選項 A（採用）**：`developer/page.tsx` 直接 `supabase.rpc('get_hero_stats')`

- 不經過 `developer.ts:getHeroStats()` Server Action
- 理由：`page.tsx` 已有 `ensureDeveloper()` 確認（開發者只能到達此頁），避免重複 `getUser()` round-trip

**選項 B（拒絕）**：`page.tsx` 改用 `getHeroStats()` Server Action

- 問題：`getHeroStats()` 內部又呼叫 `ensureDeveloper()`，多一次 `getUser()` 呼叫

### D3：Top N 展示數量

SQL LIMIT 改為 20，前端 `DeveloperConsoleClient.tsx` 改為 Top 10 展示（原 Top 5）。這是低風險 UI 改善，同包。

## Risks / Trade-offs

| 風險 | 嚴重度 | 緩解 |
|---|---|---|
| `bigint` 型別轉換（`Number()` overflow） | Low | 英雄計數最多幾千，遠低於 2^53 |
| `auth.jwt()` 在 SECURITY DEFINER 不可用 | Low | Supabase 文件確認可用；先在 SQL Editor 測試 |
| `developer/page.tsx` 直呼 rpc 繞過 Server Action 授權 | Low | page.tsx 已有 server-side redirect 守門；SQL function 有二層 role check |
| `unnest` 空陣列行為 | None | 空陣列回傳空集合，不產生統計干擾 |

## 預先定義詮釋框架

| 結果 | 結論 |
|---|---|
| `get_hero_stats()` 回傳正確排名，與手動 SQL 比對一致 | 修復成功 |
| developer role check 拒絕非開發者 RPC 呼叫 | 安全確認 |
| `developer/` 頁面英雄統計區塊正確顯示 | UI 驗收通過 |
| `getHeroStats()` Server Action 路徑（Client 觸發場景）正常 | 向後相容確認 |
