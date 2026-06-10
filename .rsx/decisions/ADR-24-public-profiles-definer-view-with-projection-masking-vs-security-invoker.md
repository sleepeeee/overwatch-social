---
id: ADR-24
title: "公開讀 view 維持 SECURITY DEFINER + 投影遮罩 PII（否決 security_invoker 路線）"
status: Accepted
change: harden-supabase-security
date: 2026-06-11
references_to: [ADR-01, F-014, ADR-14, REF-004, REF-005, REF-011, F-024, F-025]
referenced_by: [F-024, F-025, ADR-25, F-026]
---

## 決策

`public_profiles` view 維持 `SECURITY DEFINER`（view 以 owner 身分執行底層查詢），
**否決**將其改為 `security_invoker` 的方向（原 [[ADR-01]] backlog 所提）。
同時：
1. view 投影的 `social_channels` 欄位以 `jsonb_object_agg(k, true)` 遮罩，保留平台鍵名（供廣場圖示）但移除帳號值 PII。
2. `REVOKE SELECT ON public.profiles FROM anon`（defense-in-depth：anon 無法繞過 view 直查 base table）。
3. Supabase security advisor `security_definer_view` ERROR **文件化為 controlled exception**（刻意保留，不列 ERROR=0 驗收）。

## 背景與觸發事件

- `harden-supabase-security` change 蒐證發現：`public_profiles` view（definer）投影含 `social_channels` 真實帳號欄位，且 GRANT SELECT 給 anon，任何人可 `curl` 拿到所有公開名片的 Discord/Twitter/Line 帳號。
- 根因：`migration 015` 為了廣場 social 圖示把 `social_channels` 補回 view 投影，**回退了 [[F-014]]** 的隱私修復（migration 008 已將 social_channels 排除於 anon-readable view 之外）。
- 同一 change 的 advisor 掃描確認：view 為 definer + 投影含帳號 PII（`{"discord":"akira#1234"}`）→ advisor ERROR `security_definer_view`。

## 考量選項

### 方案 X（原 ADR-01 backlog）：改 security_invoker + 補 anon RLS policy

```
view 改 WITH (security_invoker = true)
→ 呼叫方（anon）身分執行底層 SELECT FROM profiles
→ 需同時補 CREATE POLICY "anon read visible profiles" ON profiles FOR SELECT TO anon USING (is_tag_visible = true)
```

**Postgres 語意分析**：`security_invoker` view 以 caller 身分執行底層查詢，必須讓 caller 對 base table 有 SELECT + RLS pass。
補了 anon SELECT policy 後：
- `public_profiles` view 可正確讀回公開名片 ✅
- **但 anon 現在對 `profiles` base table 有 SELECT policy** → anon key 可繞過 view 直打 Supabase REST API：`/rest/v1/profiles?select=social_channels&is_tag_visible=eq.true` → 仍能拿到原始帳號 PII ❌
- RLS 是 row-level 非 column-level；無法讓 anon 只讀部分欄位（Postgres 沒有 column-level RLS）。
- **結論：security_invoker 路線無法在不引入 anon base table policy 的條件下運作；一旦補 anon policy，隱私回歸。**

### 方案 Y（採用）：維持 definer + 投影遮罩 + REVOKE anon base table

```
view 繼續 SECURITY DEFINER（owner 執行，anon 不需 base table policy）
→ view 投影：social_channels 以 jsonb_object_agg(k, true) 遮罩（{discord: true} 而非 {discord:"akira#1234"}）
→ REVOKE SELECT ON profiles FROM anon（defense-in-depth：明確阻斷 anon 直查 base table 的任何路徑）
→ advisor ERROR security_definer_view 接受並文件化（控制性例外）
```

**隱私保證**：
- anon 只能走 view，不能直查 base table（REVOKE 保障）
- view 的 social_channels 欄位值全為 `true`，無帳號 PII
- 廣場圖示正常（前端 OWCard 只用 key 存在性渲染圖示，不顯示 value）

**取捨**：advisor 永遠報 ERROR `security_definer_view`（Supabase 對所有 definer view 一律報 ERROR，無旗標可豁免）。本決策明確以「隱私 > advisor 綠燈」為優先序。

| 評估項 | security_invoker（方案 X）| definer + 遮罩（方案 Y，採用）|
|---|---|---|
| 廣場 anon 讀到公開名片 | ✅（需補 anon policy）| ✅（definer 繞 RLS）|
| social_channels 帳號不洩漏 | ❌（anon 可繞 view 直查）| ✅（遮罩 + REVOKE）|
| advisor ERROR=0 | ✅ | ❌（controlled exception）|
| ADR-01 backlog 方向 | ✅（符合原 backlog 意圖）| ❌（明確否決）|
| F-014 隱私層設計延續 | ❌（破壞 two-query tier）| ✅（definer view 作為安全邊界）|

## 決策理由

1. **Postgres RLS 無 column-level 粒度**：方案 X 補 anon policy 必然同時開放 anon 直查整列（含 `social_channels`），無法只開放部分欄位。`security_invoker` 無法實現「anon 可讀 row 但不可讀 social_channels 欄位」。

2. **隱私 > advisor 綠燈**：`security_definer_view` ERROR 是 Supabase 對 definer view 的靜態標記（不看投影內容），無法反映「遮罩後已無 PII」的實際狀態。接受 advisor 單項 ERROR 比開放隱私洩漏路徑更可接受。

3. **REVOKE 提供 defense-in-depth**：即使未來某個 migration 誤補了 anon SELECT policy（如從 git merge 衝突），`REVOKE SELECT ON profiles FROM anon` 作為第二道防線可阻斷直查。

4. **最小程式碼衝擊**：方案 Y 純 DB 邊界校正，不影響任何 TS/Next.js 應用層。方案 X 不僅需要 DB 變更，也必須確保應用層不走 base table 讀 social_channels（ADR-14 的 two-query pattern 已是對的，但還需驗證所有讀取路徑）。

5. **Codex §6.5 審查拍板（M1）**：Codex 在 PROPOSE 階段獨立確認方案 X 的隱私洩漏路徑存在，支持方案 Y 的 definer + 遮罩解。team lead 依此拍板。

## 與 ADR-01 的關係（修正 backlog 方向）

[[ADR-01]] 末段 backlog 原文：「後續若需要 view 的 RLS 行為，必須改用 `security_invoker` 或拆回 RLS policy（§6.7 Codex 建議列入 backlog）」。

本 ADR 正式**封閉並否決**此 backlog 方向：
- `security_invoker` 在「anon 廣場 + social_channels 不洩漏」的約束下不可行（無 column-level RLS）
- 正確出路是**方案 Y（definer + 投影遮罩）**，或長期解：`social_channels` 拆到獨立 `profile_contacts` 表並只開 authenticated（列為 follow-up change 候選）

ADR-01 決策本體（DB 層遮蔽）仍有效；僅其 backlog 的技術方向被本 ADR 修正。

## follow-up 登記

1. **social_channels 拆表**（長期清潔解）：將聯絡帳號與偏好旗標拆到獨立表 `profile_contacts`，只開 authenticated SELECT policy，不放入任何 anon-readable view。此舉可消除 advisor ERROR 的根因（view 不再含 social_channels 欄位）。列為 `social-channels-separate-table` change 候選。

2. **get_hero_stats SECURITY DEFINER WARN**：`get_hero_stats()` 的 advisor `authenticated_security_definer` WARN 為既有（[[ADR-05]] 有文件），非本 change 範圍，評估後可與 social_channels 拆表一起處理。
---

## 相關 REF / Finding

- [[ADR-01]]：DB 層 view 隱私遮蔽決策（本 ADR 延伸並修正其 backlog 方向）
- [[F-014]]：Supabase public view 隱私洩漏 pattern（migration 015 回退了 F-014 的隱私修復；本 change 重新校正）
- [[ADR-14]]：social_channels 走 authenticated 直查 profiles 的 two-query pattern（本 ADR 維持此設計不變）
- [[REF-004]]：Supabase RLS policy 基礎（REVOKE + policy 語意依據）
- [[REF-005]]：developer role app_metadata（item 5 developer_whitelist policy 寫法）
- [[REF-011]]：SECURITY DEFINER + search_path 鎖定模式（item 2/3 trigger function 修正依據）
- [[F-024]]：developer_whitelist 0 policy 靜默壞掉根因（本 change 同一批修復）
- [[F-025]]：social_channels 帳號經 anon-readable view 洩漏根因（migration 015 回退 F-014）
