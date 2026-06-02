---
id: REF-010
type: docs
title: PostgreSQL unnest + GROUP BY 陣列展開聚合模式
url: https://www.postgresql.org/docs/current/functions-array.html
status: active
version: "PostgreSQL 15+"
last_updated: 2026-06-03
official: true
references_to: [REF-004]
referenced_by: []
---

## 摘要

PostgreSQL 的 `unnest(array)` 函式可將陣列展開為一組 row，再搭配 `GROUP BY` 即可對陣列元素做聚合統計。這是「一個用戶有多個英雄選擇」這類 `text[]` 欄位的標準 DB 端聚合模式。

## 核心語法

```sql
-- 基本：展開 text[] 欄位並計數
SELECT unnest(selected_heroes) AS hero_id, COUNT(*) AS hero_count
FROM profiles
GROUP BY hero_id
ORDER BY hero_count DESC
LIMIT 20;

-- 封裝成 RPC function（SECURITY DEFINER）
CREATE OR REPLACE FUNCTION get_hero_stats()
RETURNS TABLE(hero_id text, hero_count bigint) AS $$
  SELECT unnest(selected_heroes)::text, COUNT(*)
  FROM profiles
  GROUP BY 1
  ORDER BY 2 DESC
  LIMIT 20;
$$ LANGUAGE sql SECURITY DEFINER;
```

## 關鍵行為

- `unnest` 空陣列（`'{}'::text[]`）回傳空集合，不產生 NULL row，統計不受干擾
- `COUNT(*)` 回傳 `bigint`，透過 Supabase JS client 可能以 `string` 或 `number` 傳遞，需 `Number()` 轉換
- `GROUP BY 1` 等同 `GROUP BY unnest(...)`，PostgreSQL 允許用位置引用，避免重複展開

## SECURITY DEFINER 與 auth.jwt() 可用性

在 `SECURITY DEFINER` 函式中，函式以 owner（postgres）身份執行，但 **呼叫方的 JWT 仍可透過 `auth.jwt()` 存取**：

```sql
-- plpgsql 版本（可加角色確認）
CREATE OR REPLACE FUNCTION get_hero_stats()
RETURNS TABLE(hero_id text, hero_count bigint) AS $$
DECLARE user_role text;
BEGIN
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') INTO user_role;
  IF user_role != 'developer' THEN
    RAISE EXCEPTION 'Permission denied: developer role required';
  END IF;
  RETURN QUERY
    SELECT unnest(selected_heroes)::text, COUNT(*) FROM profiles GROUP BY 1 ORDER BY 2 DESC LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 對本專案的啟示

- `profiles.selected_heroes text[]` 最多 3 個英雄/用戶，unnest 展開後 row 數為「玩家數 × 平均英雄選擇數」
- DB 端完成統計後只回傳 20 row（最多），vs 原來拉 500 row 在 JS 端計數
- 需要在 migration 009 建立此 function 並 GRANT 給 authenticated

## 引用場景

- `hero-stats-db-aggregation` change 的 migration 009 設計依據
- design.md 的「技術選擇 rationale 表」
- spec.md 的「DB function 行為 requirement」
