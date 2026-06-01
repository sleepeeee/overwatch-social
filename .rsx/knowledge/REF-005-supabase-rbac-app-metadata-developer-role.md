---
id: REF-005
type: docs
title: Supabase RBAC — app_metadata 角色系統（開發者身分組設計）
url: https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac
status: active
version: "Supabase Auth 2026"
last_updated: 2026-06-01
official: true
references_to: [REF-002, REF-004]
referenced_by: []
---

## 摘要

Supabase 沒有內建角色系統，但官方提供兩種主流方案：

### 方案 A — app_metadata（推薦）

`app_metadata` 儲存在 JWT token 內，**使用者無法自行修改**（必須透過 service role key 的 `auth.admin.updateUserById` 或直接 SQL 更新）。

**設定開發者身分（SQL Editor）：**
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "developer"}'
WHERE email = 'your@email.com';
```

**在 Next.js 讀取角色：**
```ts
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
const isDeveloper = user?.app_metadata?.role === 'developer';
```

**在 RLS Policy 使用：**
```sql
CREATE POLICY "developers_only"
ON some_table FOR SELECT
USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'developer');
```

### 方案 B — Auth Hook（custom_access_token_hook）

用 PostgreSQL function 在每次 token 簽發時動態注入 claims，適合需要複雜邏輯（如查表）的場景。對本專案的小規模開發者群組過於複雜，跳過。

### 方案 C — Email 白名單環境變數

```ts
const DEV_EMAILS = process.env.NEXT_PUBLIC_DEV_EMAILS?.split(',') ?? [];
const isDeveloper = DEV_EMAILS.includes(user?.email ?? '');
```

- 優點：零資料庫變動，極簡
- 缺點：需重新部署才能增減開發者；email 暴露在 client bundle（NEXT_PUBLIC 前綴）

### 本專案建議方案

**app_metadata（方案 A）**，理由：
1. JWT 內建，不需額外 DB 查詢
2. 使用者無法偽造（不同於 user_metadata）
3. 新增/移除開發者只需 SQL 一行，不需重部署
4. 與現有 REF-004 RLS 架構完全相容

---

## 對專案的啟示

本專案需要兩個身分層級：
- **一般使用者（anon/authenticated）**：所有 Google 登入者，使用標準功能
- **開發者（developer role）**：特定 email 群組，可看到 debug overlay、測試功能、開發工具列

實作路徑：
1. 在 Supabase 儀表板 SQL Editor 對指定用戶設定 `raw_app_meta_data = '{"role":"developer"}'`
2. 建立 `useDevMode()` hook → 讀取 `user?.app_metadata?.role === 'developer'`
3. 在 Layout 或特定頁面條件渲染開發者功能區塊
4. （可選）建 `dev_allowed_emails` env var 作為本地開發 fallback

**重要注意**：`app_metadata` 在 token refresh 後才反映最新值；設定後需讓使用者重新登入或等 token 自動刷新。

---

## 引用場景

- propose 階段：auth-fix-and-developer-role change 的設計依據
- `useDevMode()` hook 實作 spec
- 若未來需要 RLS 限制開發者專屬 table，使用上方 policy 範本
- 被 REF-002（SSR client 讀取 JWT claims）、REF-004（RLS policy 語法）引用

## 風險 / Caveat

- `app_metadata` 變更後，現有 JWT 在到期（通常 1 小時）前不會更新；強制立即生效需呼叫 `supabase.auth.admin.refreshUserSession()` 或讓使用者重登
- 方案 C（NEXT_PUBLIC 前綴）在 client bundle 中可見，不適合敏感用途；本專案 developer 標記不涉及財務/隱私，可接受
