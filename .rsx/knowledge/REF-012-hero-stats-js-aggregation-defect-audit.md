---
id: REF-012
type: docs
title: OW Social hero stats JS 端聚合缺陷現況審計
url: n/a
status: active
references_to: [REF-010, REF-011]
referenced_by: []
---

## 摘要

對 `developer.ts:getHeroStats()` 與 `developer/page.tsx` 的英雄統計實作進行現況審計。兩個地方均存在相同的 LIMIT 500 + JS 聚合缺陷。

## 缺陷清單

### 缺陷 D1：LIMIT 500 統計截斷（`developer.ts:getHeroStats()`）

```typescript
// developer.ts line ~159
const { data } = await supabase.from("profiles").select("selected_heroes").limit(500);
// 超過 500 名玩家時：後 N 名玩家的英雄選擇完全未計入統計
```

**影響**：玩家數 > 500 後，英雄流行度排名失真。「真正最熱門英雄」可能落在後 500 筆。

### 缺陷 D2：JS 端聚合效率低（`developer.ts`）

```typescript
// 500 筆 row 每筆 selected_heroes（最多 3 個元素）= 最多 1500 個字串
// 全部拉到 edge function 再 forEach 計數
const heroCount = new Map<string, number>();
data.forEach(row => { (row.selected_heroes ?? []).forEach(heroId => { ... }); });
```

**影響**：DB → edge 不必要的資料傳輸，浪費頻寬，增加 edge function 執行時間。

### 缺陷 D3：相同邏輯重複出現（`developer/page.tsx`）

在 `developer/page.tsx` 的 `Promise.all` 中存在第二份相同的聚合邏輯。兩處均有 D1/D2 缺陷，修復時必須同步。

## 正確解法對照

| 面向 | 現況（有缺陷）| 目標（修復後）|
|---|---|---|
| 資料量 | 全量 LIMIT 500 rows | SQL 聚合後 20 rows |
| 聚合位置 | JS edge function | PostgreSQL `unnest + GROUP BY` |
| 重複 | 兩個地方 | 統一 `supabase.rpc('get_hero_stats')` |
| 授權 | 無額外保護 | SQL 內 `auth.jwt()` role check |

## 驗證方法

- Supabase SQL Editor：`SELECT * FROM get_hero_stats()` 確認正確回傳
- 以非 developer authenticated 用戶直接呼叫 RPC 確認被拒
- 比對 `developer/` 頁面的英雄排名與 SQL Editor 直查結果一致

## 引用場景

- `hero-stats-db-aggregation` proposal.md 的問題陳述
- design.md 的「現況與問題 D1/D2/D3」段
- spec.md 的驗收條件
