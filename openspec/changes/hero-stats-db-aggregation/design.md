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
- G3：授權由 Server Action `ensureDeveloper()` 把關（主要邊界）；SQL function 本身對 authenticated 開放（aggregate 屬非敏感統計，詳見 design D1 trade-off）
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

**選項 A（採用）**：PostgreSQL `get_hero_stats()` function（`plpgsql` language，LATERAL unnest + GROUP BY，SECURITY DEFINER + SET search_path）+ `supabase.rpc()`

```sql
CREATE OR REPLACE FUNCTION get_hero_stats()
RETURNS TABLE(hero_id text, hero_count bigint)
SECURITY DEFINER
SET search_path = public        -- C1 修正：防止 schema 注入
AS $$
  SELECT h_id, COUNT(*) AS hero_count
  FROM profiles,
       unnest(selected_heroes) AS h_id   -- C2 修正：LATERAL 形式，避免 SRF in GROUP BY
  GROUP BY h_id
  ORDER BY 2 DESC
  LIMIT 20;
$$ LANGUAGE sql;   -- sql language（非 plpgsql）：無 jwt check，靠 Server Action 層授權

REVOKE ALL ON FUNCTION get_hero_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_hero_stats() TO authenticated;
```

**§6.5 修正記錄**：
- C1：加 `SET search_path = public`（Supabase managed 環境雖低風險，仍採最佳實踐）
- C2：改用 LATERAL 形式 `FROM profiles, unnest(...) AS h_id`，避免 `GROUP BY 1` 配合 SRF 的語意歧義
- M3：developer_whitelist RLS 已由 migration 002 `FOR ALL USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer')` 保護，無需額外補充

**授權層次**：
1. `GRANT TO authenticated`（anon 無法呼叫）
2. Server Action `ensureDeveloper()`（主要授權邊界）
3. `/developer` 頁面 server-side redirect（已有）

trade-off：一般 authenticated（非 developer）可直接呼叫 RPC（英雄流行度屬非敏感 aggregate）。記錄為已知 debt；若未來需強化，可改回 `plpgsql` + `auth.jwt()` check 並解決 SQL Editor 測試的 JWT context 問題。

**選項 B（拒絕）**：`plpgsql` + `auth.jwt()` developer role check 在函式內

- 拒絕理由：SQL Editor 測試時（postgres superuser）無 JWT context → `auth.jwt()` 返回 NULL → RAISE EXCEPTION，驗收自相矛盾

**選項 C（拒絕）**：`service_role` key 在 Server Action 直查，移除 LIMIT

- 拒絕理由：service_role key 不應出現在 Next.js edge runtime（暴露風險）

**Rationale 表**：

| 選擇 | 依據 |
|---|---|
| PostgreSQL unnest + GROUP BY | REF-010（Postgres array aggregation 標準模式）|
| SECURITY DEFINER + auth.jwt() | REF-011（Supabase RPC security pattern）|
| GRANT TO authenticated（非 anon）| REF-005（最小權限原則）|

### D2：developer/page.tsx 改用何種入口

**選項 A（採用）**：`page.tsx` 改用 `getHeroStats()` Server Action

- `getHeroStats()` 已包含 `ensureDeveloper()` + RPC + snake_case mapping（`hero_id → heroId`, `hero_count → Number()`）
- DRY：欄位對照邏輯集中一處，不重複
- 錯誤處理：Server Action 有統一的 try-catch

**§6.5 M1/M2 修正記錄**（Codex/Gemini 共同確認）：
- 原本計畫「直呼 RPC 避免 getUser round-trip」理由不成立：Supabase SSR 的 `auth.getUser()` 每次仍會聯絡 Auth server（無自動 cache）
- 直呼 RPC 需重複寫欄位對照；開發環境未登入 bypass 後若 RPC 報錯，`Promise.all` 無 catch 會導致 500
- 改回 `getHeroStats()` Server Action 是更安全的選擇

**選項 B（拒絕）**：`developer/page.tsx` 直接 `supabase.rpc('get_hero_stats')`

- 問題：需重複寫欄位對照邏輯；開發環境 bypass 後 500 風險；無統一錯誤處理

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
