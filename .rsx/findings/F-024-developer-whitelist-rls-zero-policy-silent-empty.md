---
id: F-024
type: finding
title: "RLS-enabled 表若無任何 policy，讀取靜默回空陣列——developer_whitelist 後台功能無聲壞掉"
status: confirmed
confidence: high
change: harden-supabase-security
date: 2026-06-11
references_to: [REF-004, REF-005, ADR-24]
referenced_by: [ADR-24]
supporting_refs: [REF-004]
---

## 結論 / 數據

`harden-supabase-security` change 蒐證發現：`public.developer_whitelist` 表 RLS 已啟用（`row security enabled = true`），但 live DB 有 **0 policy**、**4 筆資料**。

**後台功能靜默壞掉（P1）**：

```typescript
// src/app/actions/developer.ts:22
const { data, error } = await supabase
  .from('developer_whitelist')
  .select('email')
  .order('email');
const emails = data || [];
```

`supabase` 此處為 user cookie client（非 service-role），以登入用戶 JWT 呼叫。RLS enabled + 0 policy → Postgres 預設拒絕所有 SELECT → `data = null` → `data || []` 靜默回空陣列。後台白名單清單永遠顯示空，但無任何 error 或 console 警告。

**量化影響**：
- 資料筆數：4（live DB 實測）
- policy 數：0（應至少有 1）
- 後台 getWhitelistEmails() 實際回傳：`[]`（靜默空）
- 影響範圍：所有 developer 角色的後台「白名單管理」功能

**根本原因**：

Postgres 的 RLS 設計是 fail-closed——`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` 後，若無任何 policy，**所有角色（除 superuser / table owner）的讀寫一律被拒**。

`migration 002` 原建有 `Allow developers full access to whitelist`（`FOR ALL, USING role=developer`）。Supabase security advisor 報 `rls_enabled_no_policy`，與 migration 002 矛盾。蒐證確認：live DB policy 為 0（migration 002 的 policy **被手動 drop 未同步回 migration 檔，或 live 從未套 migration 002**），這是導致後台壞掉的直接原因。

**修復（migration 021）**：補兩條顯式 policy：

```sql
-- 開發者可讀（修復 getWhitelistEmails() 靜默空）
CREATE POLICY "developer_whitelist_select_developer"
  ON public.developer_whitelist FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer');

-- 開發者可增刪（CRUD 完整）
CREATE POLICY "developer_whitelist_modify_developer"
  ON public.developer_whitelist FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer');
```

修復後驗收：`getWhitelistEmails()` 正確讀回 4 筆 email；policy 數 = 2。

## 與既有 REF 一致或矛盾

[[REF-004]]（Supabase RLS 官方指南）第 1 點明確說明：「啟用後，**未建 policy 前所有 API 存取一律被拒**（這是安全預設，也是最常見坑：啟用卻忘了建 policy → 整表打不開）」。本 Finding 是該文件描述的真實案例——migration 002 建了 policy，但 live DB 無 policy。

## 對後續影響

**通則（RLS 表 policy 完整性檢查）**：

任何啟用 RLS 的 Supabase 表，在 apply migration 後必須驗證：
1. `pg_policies WHERE polrelid = '<table>'::regclass` 回傳筆數 > 0
2. 預期角色的讀寫動作可正常執行（不只是不報 error，還要確認有回傳資料）

靜默空陣列（`data || []` 吞掉 error）是特別危險的反模式——RLS 被拒不報 error，只回傳空，完全無法從 client 端分辨「表是空的」vs「RLS 拒絕存取」。

**Migration 審查 checklist 新增項**：每個 migration 建立 / 修改 RLS-enabled 表後，必須跑：
```sql
SELECT polname, cmd FROM pg_policies WHERE polrelid = '<table>'::regclass;
```
確認 policy 清單符合預期。
