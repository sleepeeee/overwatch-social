---
id: REF-011
type: docs
title: Supabase RPC + SECURITY DEFINER + JWT 角色確認模式
url: https://supabase.com/docs/guides/database/functions
status: active
version: "Supabase 2026"
last_updated: 2026-06-03
official: true
references_to: [REF-004, REF-005]
referenced_by: [REF-012, F-005, ADR-05]
---

## 摘要

Supabase 支援透過 `supabase.rpc('function_name', params)` 呼叫 PostgreSQL 函式。搭配 `SECURITY DEFINER` 可讓函式以 table owner 身份繞過 RLS，同時保留呼叫方 JWT 供角色確認。

## RPC 呼叫模式

```typescript
// Client 端（from Server Action）
const { data, error } = await supabase.rpc('get_hero_stats');
// data 型別由 Supabase 自動推斷（或手動型別化）
```

## SECURITY DEFINER 安全分析

| 面向 | 說明 |
|---|---|
| 執行身份 | table owner（postgres），繞過 RLS |
| JWT 可用性 | `auth.jwt()` 仍回傳**呼叫方**的 JWT（非 owner），可確認角色 |
| GRANT 策略 | `GRANT EXECUTE ON FUNCTION xxx TO authenticated` 讓登入用戶可呼叫 |
| Defense-in-depth | SQL function 內加 `auth.jwt() -> 'app_metadata' ->> 'role' = 'developer'` 確認 |

## 雙層保護架構

```
Client → Server Action (ensureDeveloper()) → supabase.rpc('get_hero_stats')
                                                    ↓
                              PostgreSQL get_hero_stats() { auth.jwt() role check }
```

Server Action 層：`user.app_metadata.role !== 'developer'` → throw Error
SQL function 層：`auth.jwt() -> 'app_metadata' ->> 'role' != 'developer'` → RAISE EXCEPTION

## bigint 型別注意事項

`COUNT(*)` 回傳 PostgreSQL `bigint`。Supabase JS client 在某些版本會將 bigint 序列化為 `string`（JavaScript 無法安全表示 > 2^53 的整數）。對英雄計數（幾百到幾千）安全使用 `Number(row.hero_count)` 轉換。

## 對本專案的啟示

- `get_hero_stats()` 需要 SECURITY DEFINER 才能讀所有用戶的 `profiles`（非本人 row 原本被 RLS 擋住）
- Server Action 的 `ensureDeveloper()` 是主要授權邊界，SQL 內角色確認是 defense-in-depth
- `GRANT EXECUTE TO authenticated`（非 anon），保留最小權限

## 引用場景

- migration 009 SQL 設計
- `developer.ts` getHeroStats() 改寫為 RPC 呼叫
- propose_checklist.md 安全 audit
