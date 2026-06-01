---
id: ADR-02
title: "開發者身分組採 app_metadata 方案（vs 六種替代方案）"
status: Accepted
change: auth-fix-and-developer-role
date: 2026-06-01
references_to: [REF-005, REF-004, REF-002]
referenced_by: []
---

## 決策

以 Supabase `auth.users.raw_app_meta_data` 的 `{"role":"developer"}` 欄位作為開發者身分的唯一標記，前端透過 `user.app_metadata.role === 'developer'` 判斷。

實作路徑：
1. Supabase Dashboard SQL Editor：`UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role": "developer"}' WHERE email IN (...)`
2. `src/hooks/useDevMode.ts`：`createClient().auth.getUser()` + `onAuthStateChange`，回傳 `{ isDeveloper, loading }`
3. `src/components/DevModeBanner.tsx`：Client Component，`loading || !isDeveloper` 時 render `null`（hydration 安全，見 ADR-02 rationale + REF-006）

## 考量選項

| 方案 | 不可偽造 | 增減開發者成本 | DB 變動 | client 可見 | 決策 |
|---|---|---|---|---|---|
| **A: `app_metadata`（採用）** | ✅（JWT 內建，一般 user 無法改） | SQL 一行，免重部署 | 無建表 | ⚠️ 登入者可讀 role 值，但不可偽造 | **選用** |
| B: Auth Hook（custom_access_token_hook） | ✅ | 中（改 PG function） | 需 PG function | 不直接暴露 | 小群組維護 PG function 過度複雜（P2 排除） |
| C: env email 白名單（`NEXT_PUBLIC_`） | ⚠️ 前端可見但本場景非敏感 | 需重部署 | 無 | email 進 bundle | 重部署摩擦 + email 暴露（P3 排除） |
| D: `profiles.role` 欄位 + RLS | ✅ | SQL 一行 | 需改表 + policy | 不直接暴露 | 本 change 不保護資料列、無 dev-only DB 資源，建表+policy 是過度工程（P1 排除） |
| E: 外部 IdP group mapping | ✅ | 改 IdP 設定 | 無 | 不暴露 | 適合企業 SSO，不符朋友小群組 + MVP（P3 排除） |
| ✗ `user_metadata` | ❌ 可被 client 改寫 | — | — | 暴露且可改 | 明確排除：不可作授權來源 |

> 此比較表由 Codex §6.5 method_completeness 審查觸發補充（session 019e825f，8/10 PROCEED）。

## 理由

1. **不可偽造**：`app_metadata` 只能透過 service role key 或 SQL 修改，一般已登入使用者的 `updateUser()` 只能改 `user_metadata`，無法偽造 `app_metadata.role`。
2. **最低摩擦**：增減開發者只需 SQL 一行，不需重部署（vs 方案 C）、不需建表（vs 方案 D）、不需維護 PG function（vs 方案 B）。
3. **未來可銜接 RLS**：若後續需要 dev-only DB 資源，可直接用 `auth.jwt() -> 'app_metadata' ->> 'role' = 'developer'` 寫 RLS policy（REF-004 語法 + REF-005 範本），不需遷移機制。
4. **Codex 獨立驗證**：Codex §6.5 方法完整性審查（6 方案完整比較）結論亦接受方案 A 為較穩健選擇（8/10）。

## 影響與約束

- **安全邊界**：前端 `isDeveloper` 旗標**僅供 UI 條件渲染**（顯示/隱藏 DevModeBanner）。若未來有 dev-only 資料，必須在 RLS policy 層強制（`auth.jwt() -> 'app_metadata'`），前端旗標不可作為授權依據。
- **Token 刷新延遲**：`app_metadata` 變更後，現有 JWT 在到期（~1 小時）前不反映新值；設定後需使用者重新登入（REF-005 caveat）。
- **可見性說明**：已登入者本人透過 `getUser()` 可讀到自己的 `app_metadata.role` 值。安全性來自「不可偽造」而非「不可見」；本 change 的 developer 標記非敏感資料，可見可接受（design.md M5 措辭修正段落）。
- **hydration 安全要求**：`useDevMode()` 必須回傳 `loading` 旗標；`DevModeBanner` 在 `loading === true` 時 render `null`（REF-006；非可選設計）。

## 相關 REF / Finding

- REF-005：app_metadata 角色系統技術依據與實作路徑
- REF-004：RLS policy 語法（未來 dev-only 資源的執行點）
- REF-002：Supabase client 分層（`getUser()` 在 browser client）
- F-002：Navbar/AppSidebar 未掛載發現 → 影響 Task 2 latent 修復策略
