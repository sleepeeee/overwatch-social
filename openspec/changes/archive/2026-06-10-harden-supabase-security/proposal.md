## Why

Supabase security advisor（2026-06-11 實測）對 production project `cxoncanfveqtfofcqyqe` 回報 **1 ERROR + 3 WARN + 1 INFO** 共 5 項資料庫安全邊界問題，全部屬於 RLS / SECURITY DEFINER / GRANT / policy 的設定校正。其中：

- **public_profiles view 為 SECURITY DEFINER**（advisor ERROR），繞過 RLS。**唯讀蒐證揭出更嚴重的已上線隱私漏洞**：該 view 投影含 `social_channels` 真實帳號（`{"discord":"akira#1234"}`）且 GRANT 給 anon，任何人可 `curl` 取得所有公開名片的聯絡帳號——migration 015 為了廣場圖示把它補回，回退了 [[F-014]] 的隱私修復。**why now**：advisor ERROR + 已上線 PII 洩漏雙重觸發。**方案修正（M1，Codex §6.5 審查拍板）**：原 [[ADR-01]] backlog 提的「改 `security_invoker`」經審查**否決**——invoker view 以呼叫方身分讀 base table，會強制 anon 對 profiles 具備 SELECT+RLS，反而讓 anon 直查 base table 拿帳號。改採**維持 definer + view 層遮罩 social_channels 成布林 + REVOKE anon 直查**，security_definer_view ERROR 文件化為 controlled exception（見 design.md M1 決策）。
- **developer_whitelist RLS 啟用但 advisor 報無 policy**（INFO，實務影響 P1）：後台 `getWhitelistEmails()`（`src/app/actions/developer.ts:22`）以使用者 cookie client 讀取，若 policy 真的缺失，RLS 預設拒絕 → 永遠讀回空陣列被 `data || []` 靜默吞掉（潛在壞掉的功能）。

這 5 項內聚度最高（同一安全主題、同一驗收循環＝重跑 advisor），一起處理、一起 archive。

## What Changes

新增單一 migration `021_harden_supabase_security.sql`（編號從 021 起，020 已存在），收斂 5 個安全邊界：

1. **[ERROR] security_definer_view + 已上線 PII 洩漏**：`public.public_profiles` **維持 SECURITY DEFINER**，但投影把 `social_channels` 以 `jsonb_object_agg(k, true)` 遮罩成「平台存在性布林」（移除帳號值），並 `REVOKE SELECT ON profiles FROM anon`。advisor `security_definer_view` ERROR 文件化為 controlled exception（不列 ERROR=0 驗收）。battle_tag 依 is_tag_visible 遮蔽邏輯不變。
2. **[WARN] anon_security_definer_function_executable**：`REVOKE EXECUTE ON FUNCTION public.handle_developer_role_sync() FROM anon, authenticated;`——它是 auth.users 的 BEFORE trigger function，不該對外暴露 `/rest/v1/rpc/` 呼叫面。
3. **[WARN] function_search_path_mutable**（3 個 function）：`update_updated_at`、`update_user_profiles_updated_at`、`handle_developer_role_sync` 各加 `SET search_path = ''`（empty，最嚴格；函式體內所有物件引用改 schema-qualified），防 search_path 注入。
4. **[WARN] public_bucket_allows_listing**：收斂 storage bucket `announcement-icons` 的 `Public read announcement icons` SELECT policy，使其不可列舉整個 bucket（public bucket 物件本就可由 URL 直取，廣 SELECT policy 非必要）。
5. **[INFO→P1] rls_enabled_no_policy**：為 `public.developer_whitelist` 補 developer SELECT policy（僅 `app_metadata.role='developer'` 可讀，比照 [[migration 004]] 的 `profiles select developer` 寫法）。

> **PROPOSE 邊界**：本 change 只產出 migration 草案 + spec + 驗收標準。實際 `apply_migration` / 任何 DDL 由 team lead 在 APPLY 階段主導。design.md 的 evidence 區含 team lead 須先跑的唯讀驗證查詢（標 `[VERIFY]`）。

## Capabilities

### New Capabilities
- `db-security`: Supabase 資料庫安全邊界硬化能力——公開讀 view 採 security_invoker + RLS 把關、SECURITY DEFINER trigger function 不對外暴露、function search_path 鎖定、storage bucket 不可列舉、RLS-enabled 表必有對應 policy。

## Impact

- **資料庫（待 APPLY 套用）**：新增 migration `supabase/migrations/021_harden_supabase_security.sql`；改動對象——`public_profiles` view（維持 definer，遮罩 social_channels）、`profiles`（REVOKE anon SELECT）、`handle_developer_role_sync()` / `update_updated_at()` / `update_user_profiles_updated_at()`（加 search_path + REVOKE PUBLIC EXECUTE）、`developer_whitelist`（補 developer SELECT + FOR ALL policy）、`announcement-icons` storage policy（移除可列舉）。
- **應用層**：無程式碼變更（純 DB 邊界校正）。`getWhitelistEmails()` 行為由「可能靜默空」轉為「正確讀回資料」，無需改 TS。
- **驗收**：`get_advisors(security)` 除 `security_definer_view`（文件化豁免）外其餘 WARN/INFO 清除；anon 經 view 讀到的 social_channels 無帳號 PII 且 anon 直查 profiles 被拒；developer_whitelist 後台清單正確讀回（P1 修復）；廣場 / 玩家詳細頁 / 後台三條讀取路徑行為不變。
- **ADR（待 ARCHIVE 正式建）**：「公開讀 view 採 security_invoker + RLS 把關（vs SECURITY DEFINER bypass）」。

## Related

- [[ADR-01]] DB 層 view 隱私遮蔽（本 change 兌現其 backlog：view 改 security_invoker）
- [[F-014]] Supabase public view 隱私洩漏 pattern（two-query privacy tier 設計，本 change 保持其投影白名單不變）
- [[REF-004]] Supabase RLS（profiles policy 與 view GRANT 基礎）
- [[REF-005]] Supabase RBAC app_metadata developer role（item 5 policy 寫法依據）
- [[REF-011]] SECURITY DEFINER + search_path 鎖定模式（item 2/3 依據）
