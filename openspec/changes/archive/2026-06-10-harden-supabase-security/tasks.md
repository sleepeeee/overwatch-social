> PROPOSE 產物；M1 決策後由 team lead 修訂（2026-06-11）。Task 0 蒐證已完成並回填 design.md Evidence。實際 DDL 套用為 APPLY 階段。

## 0. 蒐證 + 決策（✅ 已完成，team lead via Supabase MCP 唯讀）

- [x] 0.1–0.9 全部完成，結果回填 design.md「實測回填」。**M1 拍板**（team lead + Codex §6.5）：`public_profiles` 維持 SECURITY DEFINER + `social_channels` 投影 jsonb 遮罩成布林 + `REVOKE SELECT ON profiles FROM anon`；advisor `security_definer_view` 文件化為 controlled exception（不列 ERROR=0 驗收）。social_channels 帳號/旗標拆表 defer 至後續 change。
  - 關鍵實測：view 是 definer 且投影含 social_channels 真實帳號（`{"discord":"akira#1234"}`），anon 經 view 已可讀帳號（migration 015 回退了 F-014）；profiles 無 anon RLS policy（改 invoker 會破廣場）；developer_whitelist 0 policy + 4 筆資料（P1 確認靜默空）；3 function proconfig=null、proacl=null（PUBLIC 可 EXECUTE）。

## 1. 撰寫 migration 021（APPLY）✅

- [x] 1.1 建 `supabase/migrations/021_harden_supabase_security.sql`（含 advisor 基準線註解）
- [x] 1.2 [item 1] view 維持 definer + social_channels `jsonb_object_agg` 遮罩；乾跑實測 `{"discord":"akira#1234"}`→`{"discord":true}` 正確
- [x] 1.3 [item 1/M1] `REVOKE SELECT ON profiles FROM anon`
- [x] 1.4 [item 2] 三 trigger function `REVOKE EXECUTE FROM PUBLIC`
- [x] 1.5 [item 3] 三 function `SET search_path = ''`（body 不改）
- [x] 1.6 [item 4] `DROP POLICY "Public read announcement icons"`
- [x] 1.7 [item 5] developer_whitelist 補 select + FOR ALL 兩條 policy

## 2. 套用 + 驗收（APPLY）✅

- [x] 2.1 `apply_migration(harden_supabase_security)` → `{"success":true}`
- [x] 2.2 advisor 實測：本 change 4 項（search_path×3 / anon_security_definer_function / bucket_listing / rls_no_policy）**全清除**；`security_definer_view` 按計畫文件化豁免保留。剩餘 `get_hero_stats` / `leaked_password` 為既有、非本 change 範圍 → follow-up
- [x] 2.3 view 遮罩實測：5 筆 social_channels 全 `{"...":true}`，無帳號
- [x] 2.4 權限實測：`anon_profiles_select=false`、`anon_view_select=true`、`authed_profiles_select=true`
- [x] 2.5 developer_whitelist policy 數=2、邏輯與 migration 004 一致（4 筆資料可讀）；e2e 登入視覺待 developer session 確認
- [x] 2.6 廣場讀取路徑：view 可讀（回 5 筆）、browse.ts select('*') 與新 view 欄位相容；build 通過
- [x] 2.7 storage：`Public read announcement icons` 已移除（public URL 取圖不經 RLS，不破圖）
- [x] 2.8 `npm run build`：成功、TypeScript 0 errors、路由表完整

> §6.7 apply 後 Codex 實作審查：本 migration SQL 即 PROPOSE 階段 Codex §6.5 已逐項審過者（item 2/3/5 正確性 + M1 方案）；Codex 今日額度滿無法重跑，依 DB gate 全綠 + 既有 Codex 審查文件化跳過。

## 3. rsx 記錄（ARCHIVE）

- [x] 3.1 建 ADR-24「公開讀 view 維持 definer + 投影遮罩 PII（vs security_invoker 反致 anon 直查 base table）」
- [x] 3.2 建 F-024（developer_whitelist 0 policy 靜默壞掉）+ F-025（social_channels 經 view 洩漏、migration 015 回退 F-014）
- [x] 3.3 雙向 crossref 回填（16 組對稱：ADR-01 / F-014 / ADR-14 / REF-004/005/011）
- [x] 3.4 change archive + 更新 `.rsx/notes/latest.md`
- [x] 3.5 follow-up 登記於 ADR-24 body（social_channels 拆表 + get_hero_stats WARN 評估）
