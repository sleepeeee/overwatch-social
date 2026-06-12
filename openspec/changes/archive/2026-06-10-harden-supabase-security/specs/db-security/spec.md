# db-security

## ADDED Requirements

### Requirement: 公開讀 view 遮罩聯絡資訊 PII，anon 不得直查 base table
`public.public_profiles` view SHALL 維持 SECURITY DEFINER（以 owner 身分執行），但其投影 SHALL 將 `social_channels` 遮罩為「平台存在性布林」（移除帳號值）；同時 SHALL 對 anon 撤銷 `profiles` base table 的 SELECT 權限，使 anon 僅能透過遮罩後的 view 讀取公開名片，無法繞過 view 直查 base table 取得聯絡帳號。

> **決策依據（M1，team lead + Codex §6.5 審查拍板）**：`security_invoker = true` 的 view 以呼叫方身分讀 base table，會**強制** anon 對 `profiles` 具備 SELECT 權限與 RLS policy，反而讓 anon 能直接 `curl profiles?select=social_channels` 取得帳號 PII。唯有**維持 definer + view 層遮罩 + REVOKE anon 直查**三者並用，才能同時滿足「廣場匿名可讀」「聯絡帳號不洩漏」「anon 不可繞 view」。advisor 的 `security_definer_view` ERROR 為**刻意保留的 controlled exception**（view 以 owner 身分做存取控制是其正當用途），於 ADR 文件化，**不列入 ERROR=0 驗收**。此修法同時修復一個已上線隱私回歸：migration 015 為廣場圖示把 `social_channels` 帳號補回 anon-readable view，回退了 [[F-014]]——本 change 順勢校正。

#### Scenario: 廣場匿名瀏覽保留且社群圖示仍顯示
- **WHEN** anon 角色查詢 `public_profiles`（廣場）
- **THEN** `is_tag_visible = true` 的名片基本資訊 SHALL 正常回傳，且 `social_channels` 的平台鍵 SHALL 保留供前端渲染圖示

#### Scenario: 聯絡帳號 PII 不對 anon 經 view 洩漏
- **WHEN** anon 角色查詢 `public_profiles` 的 `social_channels`
- **THEN** 每個平台的值 SHALL 為布林 `true`（存在性標記），SHALL NOT 包含帳號字串（如 `"akira#1234"`）——延續 [[F-014]] / [[ADR-14]] 的「聯絡資訊僅 authenticated 可見」原則

#### Scenario: anon 無法繞過 view 直查 base table
- **WHEN** anon 直接查詢 `profiles` base table（非經 view）
- **THEN** 查詢 SHALL 被拒（anon 的 `SELECT ON profiles` 權限已撤銷）

#### Scenario: 登入用戶仍能取得完整聯絡帳號
- **WHEN** authenticated 用戶於 `/player/[id]` 直查 `profiles` 取 `social_channels`
- **THEN** 完整帳號 SHALL 正常回傳（authenticated 的 base table 權限與 RLS policy 不受影響，ADR-14 two-query 不破）

### Requirement: trigger function 不對外暴露 RPC
`public.handle_developer_role_sync()` SHALL 對 anon、authenticated、public 撤銷 EXECUTE 權限，使其無法經 PostgREST `/rest/v1/rpc/` 被直接呼叫。

#### Scenario: anon 無法呼叫 trigger function
- **WHEN** anon 或 authenticated 嘗試經 RPC 呼叫 `handle_developer_role_sync`
- **THEN** 呼叫 SHALL 被拒（權限不足）

#### Scenario: trigger 正常運作不受影響
- **WHEN** auth.users 發生 INSERT 或 email UPDATE
- **THEN** `on_auth_user_role_sync` trigger SHALL 正常觸發並同步 developer role（trigger 觸發不走 EXECUTE grant 檢查）

### Requirement: 函式 search_path 鎖定
`update_updated_at`、`update_user_profiles_updated_at`、`handle_developer_role_sync` 三個 function SHALL 設定 `search_path = ''`，防止 search_path 注入，且函式原有邏輯保持不變。

#### Scenario: advisor 不再報 function_search_path_mutable
- **WHEN** 套用 migration 後重跑 `get_advisors(security)`
- **THEN** 三個 function 的 `function_search_path_mutable` WARN SHALL 清除

#### Scenario: updated_at trigger 邏輯不變
- **WHEN** 對 profiles / user_profiles / announcements 執行 UPDATE
- **THEN** `updated_at` SHALL 仍被自動設為 `now()`（空 search_path 下 `pg_catalog.now()` 可解析）

### Requirement: public storage bucket 不可列舉
`announcement-icons` bucket 的存取 policy SHALL NOT 允許 anon 列舉（LIST）整個 bucket 的物件清單；既有透過已知 public URL 取單一 icon 的能力 SHALL 保持。

#### Scenario: 無法列舉整個 bucket
- **WHEN** anon 嘗試列舉 `announcement-icons` 的所有物件
- **THEN** 列舉 SHALL 被拒或回空

#### Scenario: 首頁公告 icon 仍可顯示
- **WHEN** 首頁載入含 custom_icon_url 的公告
- **THEN** icon 圖片 SHALL 仍正常透過其 public URL 載入

### Requirement: RLS-enabled 表必有對應讀取 policy
`public.developer_whitelist`（RLS 已啟用）SHALL 具備明確的 developer SELECT policy，使 `app_metadata.role = 'developer'` 的用戶能讀取白名單。

#### Scenario: developer 後台正確讀回白名單
- **WHEN** developer 用戶透過 `getWhitelistEmails()`（cookie client）讀取
- **THEN** 白名單資料 SHALL 正確回傳，不再因缺 policy 被 RLS 預設拒絕而靜默回空

#### Scenario: 非 developer 讀不到白名單
- **WHEN** 一般 authenticated 或 anon 嘗試讀 developer_whitelist
- **THEN** 查詢 SHALL 回空（policy 條件不符）

#### Scenario: advisor 不再報 rls_enabled_no_policy
- **WHEN** 套用 migration 後重跑 `get_advisors(security)`
- **THEN** `developer_whitelist` 的 `rls_enabled_no_policy` 提示 SHALL 清除
