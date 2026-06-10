## 設計重點

### 0. Rationale 表（技術選擇 ↔ prior work）

| 安全項 | 修法 | 決策依據（prior work） |
|---|---|---|
| 1. public_profiles SECURITY DEFINER | `security_invoker = true` | [[ADR-01]] backlog 原文「須改 security_invoker 或拆回 RLS policy」；[[F-014]] two-query privacy tier 不變 |
| 2. handle_developer_role_sync 可被 anon RPC | `REVOKE EXECUTE FROM anon, authenticated` | [[REF-011]] 最小權限 GRANT（trigger function 不需對外）；對照 [[migration 009]] `REVOKE ALL FROM public` 範式 |
| 3. 3 個 function search_path 可變 | `SET search_path = ''` | [[REF-011]] 「固定 search_path 避免 Schema 注入」；migration 009 已示範 `SET search_path = public` |
| 4. announcement-icons bucket 可列舉 | 收斂 SELECT policy | [[F-014]] 同源原則「面向 anon 的物件不應暴露可列舉面」 |
| 5. developer_whitelist 無 policy | 補 developer SELECT policy | [[migration 004]] `profiles select developer` 寫法；[[REF-005]] app_metadata RBAC |

### 1. security_invoker：核心決策（預期 ADR）

`public_profiles` 目前（migration 017 重建版）是預設 `SECURITY DEFINER` view——以 view owner（postgres）身分執行底層 `SELECT FROM profiles`，**繞過呼叫方的 RLS**。advisor 報 ERROR `security_definer_view`。

改 `WITH (security_invoker = true)` 後，view 以**呼叫方**身分執行底層查詢，RLS policy 重新生效。關鍵正確性問題：**改 invoker 後 anon / authenticated 是否仍讀得到公開名片？**

- `profiles` 表現有相關 SELECT policy（migration 001 + 004 + 008）：
  - `profiles select own`（authenticated, own row）
  - `profiles select developer`（authenticated, role=developer 全表）
  - `authenticated read visible profiles`（authenticated, `is_tag_visible = true OR own`）
- **缺口**：**沒有任何 anon SELECT policy on profiles**。security_invoker view 以 anon 身分執行時，RLS 會擋掉所有列 → **廣場（未登入）會讀回空**。

> ⚠️ **這是本 change 最關鍵的正確性風險（M1）**。單純把 view 改 invoker 會打破廣場匿名瀏覽。必須**同時**為 `profiles` 補一條 anon SELECT policy，且該 policy 必須複刻 view 原有的「只露 is_tag_visible=true 的公開列」語意。

設計解法（M1 對應）：補 policy

```sql
CREATE POLICY "anon read visible profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (is_tag_visible = true);
```

注意：此 policy 讓 anon 可直接 `SELECT * FROM profiles WHERE is_tag_visible=true`，**包含 social_channels 原始欄位**。這會**回退 [[F-014]] 的隱私修復**（social_channels 對 anon 洩漏）！因此 anon policy **不能**開在含 social_channels 的 base table 整列上。

**修正解法（M1 最終）**：security_invoker view 對 anon 的可行路徑有二，需 team lead 拍板（design 提兩案，建議 B）：

- **方案 A（column-level grant）**：保持 view 為 SECURITY DEFINER 不動，改用 Postgres 15+ 的「view 不報 definer 警告」做法——但 advisor 仍會報 ERROR，不採。
- **方案 B（推薦）：view 改 invoker + 為 anon 補「僅公開欄位」的存取**。因 RLS 是 row-level 不是 column-level，無法讓 anon 只讀部分欄位。故正解是：**view 保持 invoker，anon policy 用 `USING (is_tag_visible = true)`，但 social_channels 的隱私改由「view 投影不含 social_channels for anon」保證**——然而現行 view 投影含 social_channels（migration 015/017 補回，供登入後廣場圖示）。

> **結論（需 team lead 決策，列為 M1 必修）**：security_invoker 與「anon 廣場可讀 + social_channels 不洩漏」三者有張力。**最小破壞解**：
> 1. view 改 invoker；
> 2. 新增 anon SELECT policy `USING (is_tag_visible = true)`；
> 3. **從 public_profiles view 投影移除 social_channels**（回到 migration 008 的隱私白名單），social_channels 改由 authenticated 直查 profiles（[[F-014]] / [[ADR-14]] 既有 two-query pattern 本就如此設計，廣場圖示對未登入者本就不該顯示聯絡方式）。
>
> 此舉同時修復一個**潛在既有隱私回歸**：migration 015 補回 social_channels 進 anon-readable view，等於部分回退了 F-014。本 change 順勢校正。**惟「廣場 social_channels 圖示對 anon 顯示」是否為刻意產品需求，須 team lead 確認**（[VERIFY-PRODUCT]）。

### 2. search_path = '' 的函式體改寫

3 個 trigger function 加 `SET search_path = ''`（empty 最嚴格）。代價：函式體內所有物件引用須 **schema-qualified**。

- `update_updated_at` / `update_user_profiles_updated_at`：函式體只用 `NEW.updated_at = now()`，`now()` 是 `pg_catalog.now()`——`pg_catalog` 永遠在隱式 search_path，**空 search_path 下仍可解析**，無需改寫。安全。
- `handle_developer_role_sync`：函式體引用 `public.developer_whitelist`（已 schema-qualified）+ `jsonb_set` / `COALESCE`（pg_catalog 內建）。已安全，加 `SET search_path = ''` 即可。

> 三者皆 `CREATE OR REPLACE FUNCTION ... SET search_path = ''`，**保留原邏輯一字不改**，只加 SET 子句。

### 3. REVOKE trigger function 的 EXECUTE

`handle_developer_role_sync()` 是 `auth.users` 的 BEFORE INSERT/UPDATE trigger。它被 anon/authenticated 透過 PostgREST 自動暴露為 RPC（Supabase 預設把 public schema function 暴露）。trigger function 不該被直接呼叫：

```sql
REVOKE EXECUTE ON FUNCTION public.handle_developer_role_sync() FROM anon, authenticated, public;
```

trigger 本身以表 owner 身分觸發，REVOKE EXECUTE **不影響 trigger 正常運作**（trigger 執行不走 GRANT 檢查）。

### 4. storage bucket policy 收斂

`announcement-icons` 是 public bucket。`Public read announcement icons` policy 允許 `SELECT ON storage.objects`，使 anon 可 `LIST` 整個 bucket（列舉所有檔名）。public bucket 的物件本就可由 public URL 直取，**列舉能力非必要**。

收斂方向（須先 [VERIFY] 現行 policy 定義）：
- 若應用層只透過已知 URL 取 icon（announcements.custom_icon_url 存完整 URL），則 SELECT policy 可直接 DROP（public bucket 的 object URL 取用不經 RLS）。
- 保守做法：保留 SELECT 但加 `bucket_id` 限定 + 不開放 `LIST`（Supabase storage 的 list 走 `SELECT` on objects）。

> 此項依賴 [VERIFY] 現行 storage policy 全文與應用層存取方式，**列為 M2**（需先蒐證再定稿 SQL）。

### 5. developer_whitelist SELECT policy

migration 002 原已建 `Allow developers full access to whitelist`（FOR ALL, USING role=developer）。**但 advisor 報 `rls_enabled_no_policy`**——兩者矛盾，三種可能：(a) live DB 的 policy 被手動 drop 未進 migration；(b) advisor 認 `FOR ALL` policy 不算 SELECT-applicable（不太可能）；(c) 表名誤判。

> **[VERIFY-CRITICAL]**：team lead 須先跑下方 evidence 查詢核對 live `pg_policies`。依結果二擇一：
> - 若 live 真無 policy → 補 developer SELECT policy（下方 SQL item 5）。
> - 若 live 有 `FOR ALL` policy 但 advisor 仍報 → 補一條**明確 SELECT** policy（advisor 偏好顯式），不刪原 policy。

兩種情況都收斂為「補一條明確 developer SELECT policy」，與既有 FOR ALL policy 以 OR 邏輯共存，無副作用：

```sql
CREATE POLICY "developer_whitelist_select_developer"
  ON public.developer_whitelist FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer');
```

---

## Migration SQL 草案（`021_harden_supabase_security.sql`）

> 草案。M1（view/anon/social_channels 張力）與 M2（storage policy）的最終定稿須待 team lead 的 [VERIFY] 蒐證與產品決策。以下為「依目前推斷的最小破壞解」版本。

```sql
-- ============================================================
-- Migration 021: Supabase 安全邊界硬化（security advisor 5 項）
-- 對應 change: harden-supabase-security
-- ============================================================

-- ---- [1] public_profiles 改 security_invoker（advisor ERROR）----
-- 同時把 social_channels 移出 anon-readable view（校正 migration 015 的隱私回歸）
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true) AS
  SELECT
    p.user_id,
    p.server,
    CASE WHEN p.is_tag_visible THEN p.battle_tag ELSE '隱藏#xxxx' END AS battle_tag,
    p.is_tag_visible,
    p.selected_heroes,
    p.tags,
    p.message,
    p.languages,
    p.mic_status,
    p.mbti,
    p.updated_at,
    p.display_name,
    p.game,
    -- social_channels 移除：聯絡資訊僅 authenticated 直查 profiles（F-014 / ADR-14）
    up.nickname
  FROM public.profiles p
  LEFT JOIN public.user_profiles up ON up.user_id = p.user_id;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- security_invoker 後，anon 需有 profiles SELECT policy 才能讀到公開名片
CREATE POLICY "anon read visible profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (is_tag_visible = true);
-- ⚠️ M1：此 policy 讓 anon 可直查 profiles base table（含 social_channels 原欄）。
--    隱私靠「應用層永遠走 public_profiles view（已移除 social_channels）」不夠——
--    anon key 可繞過 view 直查 base table。詳見 design §1 M1，team lead 須定案：
--    選項 (i) 接受（社群圖示本就半公開）；選項 (ii) social_channels 改獨立表 + 不開 anon。

-- ---- [2] REVOKE trigger function 對外 EXECUTE（advisor WARN）----
REVOKE EXECUTE ON FUNCTION public.handle_developer_role_sync() FROM anon, authenticated, public;

-- ---- [3] 鎖定 3 個 function 的 search_path（advisor WARN）----
-- 只加 SET search_path = ''，函式邏輯保持原樣
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();   -- now() = pg_catalog.now()，空 search_path 下可解析
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_developer_role_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.developer_whitelist WHERE email = NEW.email) THEN
    NEW.raw_app_meta_data = jsonb_set(
      COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
      '{role}', '"developer"'::jsonb
    );
  ELSE
    NEW.raw_app_meta_data = NEW.raw_app_meta_data - 'role';
  END IF;
  RETURN NEW;
END;
$$;
-- 註：CREATE OR REPLACE FUNCTION 在 Postgres 會「保留」既有 privileges（不重置 grant）——
-- 只有 DROP+CREATE 才會重置。故上方 item 2 的 REVOKE 已足夠，此處無需重複 REVOKE。
-- 但 item 2 的 REVOKE 必須排在本 item 3 的 CREATE OR REPLACE「之前或之後皆可」（grant 不被 replace 影響）。

-- ---- [4] 收斂 announcement-icons bucket 列舉（advisor WARN）----
-- ⚠️ M2：SQL 待 [VERIFY] 現行 storage policy 全文後定稿。以下為「移除可列舉 SELECT」示意：
-- DROP POLICY IF EXISTS "Public read announcement icons" ON storage.objects;
-- public bucket 的 object 由 public URL 直取，不需 SELECT policy 即可存取單一物件。

-- ---- [5] developer_whitelist 補明確 developer SELECT policy（advisor INFO/P1）----
CREATE POLICY "developer_whitelist_select_developer"
  ON public.developer_whitelist FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer');
```

---

## Evidence（team lead 須在 APPLY 前跑的唯讀驗證）

> 本 sub-agent 在當前 context 無 Supabase MCP / service-role / psql 存取（`.env.local` 僅含 anon/publishable key，無法唯讀內省 pg_catalog）。以下查詢請 team lead 用 `mcp__supabase__execute_sql`（唯讀）或 Dashboard SQL Editor 執行，結果回填本區，作為 design 定稿與 M1/M2 決策依據。

### [VERIFY-1] 確認 advisor 現況（基準線）
```
mcp__supabase__get_advisors(project_id="cxoncanfveqtfofcqyqe", type="security")
```
預期：1 ERROR（security_definer_view）+ 3 WARN（anon_security_definer_function_executable、function_search_path_mutable×?、public_bucket_allows_listing）+ 1 INFO（rls_enabled_no_policy）。

### [VERIFY-2] public_profiles 現行 view 定義與 invoker 旗標
```sql
SELECT c.relname,
       (SELECT option_value FROM pg_options_to_table(c.reloptions)
        WHERE option_name = 'security_invoker') AS security_invoker,
       pg_get_viewdef(c.oid, true) AS view_def
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'public_profiles';
```
確認：(a) 是否真為 definer（security_invoker 應為 NULL/off）；(b) 投影是否含 social_channels（決定 M1）。

### [VERIFY-3] profiles 現有 RLS policies（決定 M1 anon 缺口）
```sql
SELECT polname, roles::regrole[] , cmd, qual
FROM pg_policy pol JOIN pg_class c ON c.oid = pol.polrelid
WHERE c.relname = 'profiles';
```
確認：是否真的**沒有 anon SELECT policy**（預期沒有 → M1 成立）。

### [VERIFY-CRITICAL-4] developer_whitelist 現有 policy + 資料筆數 + developer 讀取實測
```sql
-- (a) 現有 policies
SELECT polname, roles::regrole[], cmd, qual
FROM pg_policy pol JOIN pg_class c ON c.oid = pol.polrelid
WHERE c.relname = 'developer_whitelist';

-- (b) 資料筆數（service-role 視角，繞 RLS）
SELECT count(*) AS total_rows FROM public.developer_whitelist;
```
**這是 team lead 在 brief 明確要求的蒐證**：核對 advisor「無 policy」與 migration 002「有 FOR ALL policy」的矛盾，並確認後台是否真的靜默讀回空。
另：若可能，用一個 developer JWT 的 anon-key client 實測 `SELECT email FROM developer_whitelist`，看是否回空（重現 P1）。

### [VERIFY-5] 3 個 function 的 proconfig（search_path 現況）
```sql
SELECT proname, proconfig
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND proname IN ('update_updated_at','update_user_profiles_updated_at','handle_developer_role_sync');
```
確認：proconfig 為 NULL（無 search_path 設定 → WARN 成立）。

### [VERIFY-6] handle_developer_role_sync 的 EXECUTE grant
```sql
SELECT proname, proacl FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname='public' AND proname='handle_developer_role_sync';
```
確認 anon/authenticated 是否在 proacl（→ item 2 成立）。

### [VERIFY-7-M2] announcement-icons storage policy 全文
```sql
SELECT polname, roles::regrole[], cmd, qual, with_check
FROM pg_policy pol JOIN pg_class c ON c.oid = pol.polrelid
WHERE c.relname = 'objects' AND pol.polname ILIKE '%announcement%';
-- 並確認 bucket 是否 public
SELECT id, name, public FROM storage.buckets WHERE name = 'announcement-icons';
```
M2 SQL 定稿依此。

### [VERIFY-PRODUCT] 廣場 social_channels 圖示對 anon 顯示是否刻意需求
檢查 `OverwatchSquare.tsx` / `OWCard.tsx` 是否對未登入用戶渲染 social_channels 圖示。決定 M1 最終解。

---

## 驗證計畫（APPLY 後）

1. 重跑 `get_advisors(security)`：ERROR=0；item 2/3 對應 WARN 清除（item 4 storage WARN 視 M2 解法）。
2. developer 帳號登入 → 後台白名單清單**非空**（P1 修復確認）。
3. 三條讀取路徑回歸：
   - `/browse`（未登入）：廣場名片正常顯示（M1 anon policy 生效）。
   - `/player/[id]`（未登入 / 登入）：基本資訊 + 登入後 social_channels（[[ADR-14]] two-query 不破）。
   - `/developer`（developer）：用戶清單 + 英雄統計正常。
4. `npm run build`：TypeScript 0 errors（預期無 TS 變更，純 DB）。

## Stage 4 自審（A–F；§6.5 Codex 對抗式雙審待 team lead 並行）

> **重要**：rsx sub-agent 無法 spawn Agent（F-039），**MANDATORY Stage 6 Codex review 必須由 team lead 在主代理 context 並行發起**（ready-to-run prompt 見下「Codex dispatch block」）。以下為本 sub-agent 的自審，作為 Codex 的對照基準，**不替代** Codex。自審結論均以 Postgres / Supabase 既有語意為據，已查 Supabase RLS 官方文件佐證 (A)。

| 項 | 判定 | 一句理由 |
|---|---|---|
| (A) invoker view 需 anon RLS policy 才讀得到 | **CORRECT** | Supabase 文件：security_invoker view「obey the RLS policies of the underlying tables when invoked by anon/authenticated」。profiles 目前無 anon SELECT policy → 廣場會讀回空。M1 成立。 |
| (B) 補 anon policy 會讓 anon 直查 base table 讀到 social_channels（回退 F-014） | **CORRECT（真實隱私回歸風險）** | RLS 是 row-level 非 column-level；anon key 可繞 view 直打 `profiles?select=social_channels&is_tag_visible=eq.true`。**這是本 change 最嚴重風險。** 見下方建議解。 |
| (C) update_updated_at 系列在 search_path='' 下不需改 body | **CORRECT** | 函式體只用 `now()`＝`pg_catalog.now()`，pg_catalog 永遠在隱式 search_path，空 search_path 仍解析。三函式皆無 schema-unqualified 的 public 物件引用。 |
| (D) REVOKE 不影響 trigger 觸發；CREATE OR REPLACE 不重置 grant | **CORRECT** | trigger 觸發不檢查 EXECUTE grant（以表 owner 觸發）；Postgres `CREATE OR REPLACE FUNCTION` 保留既有 privileges，僅 DROP+CREATE 重置。故 item 3 內無需重複 REVOKE（已修正草案註解）。 |
| (E) developer_whitelist：FOR ALL policy 應已覆蓋 SELECT，但 advisor 報無 policy | **NEEDS-VERIFICATION** | Postgres `FOR ALL` policy 的 USING **確實**套用於 SELECT——故 migration 002 的 policy *理論上*已讓 developer 讀到。advisor 報 `rls_enabled_no_policy` 與此矛盾 → **live DB policy 很可能被手動 drop（未進 migration）**。[VERIFY-CRITICAL-4] 必跑。補一條顯式 SELECT policy 兩種情況都安全。 |
| (F) 5 項合一個 migration | **PASS-WITH-CONCERN** | item 1（view/anon/RLS）風險最高且唯一可能破讀取路徑；其餘 4 項低風險、純收斂。建議**單一 migration 但 item 1 放最後**，且 APPLY 時 item 1 與 anon policy 必須**同一 transaction**（避免 view 改 invoker 後、anon policy 未建之間的窗口廣場全黑）。 |

### M-level 必修疑慮（依嚴重度）

- **M1（critical，隱私 + 可用性張力）**：security_invoker + 廣場 anon 可讀 + social_channels 不洩漏，三者不可兼得於「anon 直查 base table」模型。**建議解（team lead 拍板）**：
  - **(i) 推薦——social_channels 移出 public_profiles 投影 + anon policy 只開 base table 的 row**：仍有 anon 直查 base table 拿 social_channels 的洞。**除非** social_channels 拆到獨立表（如 `profile_contacts`）只開 authenticated，才真正堵死。這是最乾淨但工作量最大的解。
  - **(ii) 折衷——保留 social_channels 在 profiles 但接受「is_tag_visible=true 的卡其聯絡資訊半公開」**：若產品上「公開名片本就含聯絡方式」（[VERIFY-PRODUCT] 確認），則 anon policy 可接受，F-014 的原意（未填可見的卡不洩漏）仍守住。
  - **(iii) 最小改——維持 view 為 definer 但用 advisor 認可的替代**：advisor 對 definer view 一律報 ERROR，無乾淨豁免；不採。
  - → **M1 需 team lead 在 [VERIFY-PRODUCT] + (i)/(ii) 間決策後才可定 migration 021 的 item 1/1.2/1.3**。
- **M2（major，需蒐證）**：item 4 storage policy 全文未知，SQL 待 [VERIFY-7-M2]。錯誤收斂可能讓首頁公告 icon 破圖。
- **M3（minor，已驗證可消）**：developer_whitelist 的 advisor/migration 矛盾——[VERIFY-CRITICAL-4] 跑完即定案；補顯式 SELECT policy 無副作用。

### Codex dispatch block（team lead 主代理並行執行，§6.5 MANDATORY）

> 本 sub-agent 無法 spawn Agent。請 team lead 收本回報後**立即**並行發起：

```
Agent(subagent_type="codex:codex-rescue", prompt=<見回報「給 team lead 的 Codex prompt」>)
```

審查目標：上述 (A)–(F) 與 M1 三選項。重點要 Codex 獨立判斷 M1 是否有本自審遺漏的第四種解（如 Postgres column-level privileges / `GRANT SELECT (col list)` 對 anon、或 PostgREST 的 `db-anon-role` 限定 view-only 存取而禁 base table 直查）。

## M1 最終決策 + 實測回填（team lead 整合 Codex §6.5，2026-06-11）

### 唯讀蒐證實測結果（取代上方 [VERIFY] 待跑項）

| 項 | 實測 | 對決策影響 |
|---|---|---|
| view security_invoker | `NULL`（definer）；投影**含 social_channels**，GRANT anon | ERROR 屬實 |
| social_channels 真實值 | jsonb，**混合**`{"discord":"akira#1234"}`（帳號 PII）與 `{"discord":"true"}`（旗標） | **已上線 PII 洩漏**；前端 OWCard 只用 truthiness 渲染圖示、不顯帳號文字 |
| profiles policies | 無任何 anon SELECT policy；`anon` 有 table GRANT 但 RLS deny → anon 直查回空 | 洩漏點純在 definer view，非 base table 直查 |
| developer_whitelist | RLS enabled、**0 policy**、**4 筆資料** | P1 確認壞掉（靜默空） |
| 3 function | proconfig=NULL、proacl=NULL（PUBLIC 可 EXECUTE） | WARN + item2 屬實 |
| storage | bucket public=true、`Public read announcement icons` TO PUBLIC USING bucket_id | 可列舉屬實 |
| hidden_tag_count | 0（目前無隱藏名片） | view 不加 WHERE，保留原語意 |
| nickname | 僅個人設定/後台用、廣場不依賴；live viewdef 無 nickname | view 不動 nickname，最小變更 |

### M1 拍板（隱私 > advisor 綠燈）

**否決** security_invoker 路線：invoker view 以 caller 身分讀 base table，需 caller 對 base table 有 SELECT+RLS；補 anon policy 後 anon 即可繞 view 直查帳號。唯有 **definer view + 投影遮罩 + REVOKE anon base** 能同時達成「廣場可讀 / 帳號不洩漏 / anon 不可繞 view」（Codex 釐清的 Postgres 語意）。`security_definer_view` ERROR 為刻意保留的 controlled exception，文件化於 ADR，不列 ERROR=0 驗收。

### 定稿 migration 021（取代上方草案）

```sql
-- ============================================================
-- Migration 021: Supabase 安全邊界硬化（security advisor 5 項 + 已上線 PII 洩漏）
-- 對應 change: harden-supabase-security
-- 基準線（2026-06-11 advisor security）：1 ERROR(security_definer_view, 文件化豁免)
--   + WARN(anon_security_definer_function_executable, function_search_path_mutable×3,
--          public_bucket_allows_listing) + INFO(rls_enabled_no_policy)
-- ============================================================

-- ---- [1] public_profiles：維持 definer，遮罩 social_channels 帳號 PII ----
-- 決策 M1：不改 security_invoker（否則 anon 須能直查 base table）；改為 view 層遮罩
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
  SELECT
    user_id,
    server,
    CASE WHEN is_tag_visible THEN battle_tag ELSE '隱藏#xxxx' END AS battle_tag,
    is_tag_visible,
    selected_heroes,
    tags,
    message,
    languages,
    mic_status,
    mbti,
    updated_at,
    display_name,
    game,
    -- 遮罩：保留平台鍵供前端圖示，value 一律 true，移除帳號 PII（延續 F-014/ADR-14）
    CASE
      WHEN social_channels IS NOT NULL AND social_channels::text <> '{}'
      THEN (SELECT jsonb_object_agg(k, to_jsonb(true)) FROM jsonb_object_keys(social_channels) k)
      ELSE social_channels
    END AS social_channels
  FROM public.profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- defense-in-depth：撤銷 anon 對 base table 的直查（RLS 已 deny，此為硬保險防未來誤加 anon policy）
REVOKE SELECT ON public.profiles FROM anon;

-- ---- [2] REVOKE trigger function 對外 EXECUTE ----
REVOKE EXECUTE ON FUNCTION public.handle_developer_role_sync() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_user_profiles_updated_at() FROM PUBLIC;

-- ---- [3] 鎖定 3 個 function search_path（body 不改）----
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_developer_role_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.developer_whitelist WHERE email = NEW.email) THEN
    NEW.raw_app_meta_data = jsonb_set(
      COALESCE(NEW.raw_app_meta_data, '{}'::jsonb), '{role}', '"developer"'::jsonb);
  ELSE
    NEW.raw_app_meta_data = NEW.raw_app_meta_data - 'role';
  END IF;
  RETURN NEW;
END; $$;
-- 註：CREATE OR REPLACE 保留 grant；上方 [2] REVOKE 已具現化 ACL，replace 後仍維持撤銷。

-- ---- [4] 收斂 announcement-icons bucket 列舉 ----
-- public bucket 物件由 /storage/v1/object/public/... URL 直取、不經 RLS，移除可列舉 SELECT policy
DROP POLICY IF EXISTS "Public read announcement icons" ON storage.objects;

-- ---- [5] developer_whitelist 補 developer policy（修 P1 靜默空）----
CREATE POLICY "developer_whitelist_select_developer"
  ON public.developer_whitelist FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer');

CREATE POLICY "developer_whitelist_modify_developer"
  ON public.developer_whitelist FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'developer');
```

> item 4 的 storage policy 移除須在 APPLY 時實測「icon public URL 仍可取 + LIST 被擋」。若移除後 icon 破圖，回退為保留 SELECT 但加 `name` 條件限制。

---

## 預期 ADR（ARCHIVE 階段建）

「公開讀 view 採 security_invoker + RLS 把關（vs SECURITY DEFINER bypass）」——記錄 view definer→invoker 的權衡、anon policy 補位、與 [[ADR-01]] backlog 的承接關係、social_channels 隱私白名單的再校正（[[F-014]] 延伸）、M1 三選項的最終取捨。
